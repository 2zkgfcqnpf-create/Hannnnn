#!/usr/bin/env python3
"""Threaded static server and private lead-storage API for TokenVolt."""

import argparse
import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlsplit


MAX_BODY_BYTES = 16 * 1024
LEAD_PATHS = {"/api/leads", "/demo/api/leads"}
HEALTH_PATHS = {"/api/health", "/demo/api/health"}
PHONE_RE = re.compile(r"^[0-9+\-\s]{7,20}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128

    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(30)
        return connection, address


def connect_database(database_path):
    connection = sqlite3.connect(database_path, timeout=5)
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.execute("PRAGMA journal_mode = WAL")
    return connection


def initialize_database(database_path):
    parent = os.path.dirname(database_path)
    os.makedirs(parent, mode=0o700, exist_ok=True)
    try:
        os.chmod(parent, 0o700)
    except OSError:
        pass

    with connect_database(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                company TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL DEFAULT '',
                consent INTEGER NOT NULL CHECK (consent = 1),
                status TEXT NOT NULL DEFAULT 'new',
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)"
        )

    try:
        os.chmod(database_path, 0o600)
    except OSError:
        pass


def clean_text(payload, key, max_length, required=True):
    value = payload.get(key, "")
    if not isinstance(value, str):
        raise ValueError("字段格式不正确")
    value = value.strip()
    if required and not value:
        raise ValueError("请完整填写必填项")
    if len(value) > max_length:
        raise ValueError("填写内容过长")
    return value


def validate_lead(payload):
    if not isinstance(payload, dict):
        raise ValueError("提交内容格式不正确")

    lead = {
        "name": clean_text(payload, "name", 40),
        "company": clean_text(payload, "company", 80),
        "phone": clean_text(payload, "phone", 20),
        "email": clean_text(payload, "email", 100),
        "message": clean_text(payload, "message", 500, required=False),
    }

    if not PHONE_RE.fullmatch(lead["phone"]):
        raise ValueError("联系电话格式不正确")
    if not EMAIL_RE.fullmatch(lead["email"]):
        raise ValueError("邮箱格式不正确")
    if payload.get("consent") not in (True, 1, "1", "true", "on"):
        raise ValueError("请确认信息用途")

    return lead


class TokenVoltHandler(SimpleHTTPRequestHandler):
    server_version = "TokenVolt/2.0"

    @property
    def request_path(self):
        return urlsplit(self.path).path.rstrip("/") or "/"

    def end_headers(self):
        if self.request_path in LEAD_PATHS or self.request_path in HEALTH_PATHS:
            self.send_header("Cache-Control", "no-store")
        elif self.request_path.endswith((".png", ".svg", ".css", ".js")):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        if self.request_path in HEALTH_PATHS:
            try:
                with connect_database(self.server.database_path) as connection:
                    connection.execute("SELECT 1").fetchone()
            except sqlite3.Error:
                self.send_json(HTTPStatus.SERVICE_UNAVAILABLE, {"ok": False})
                return
            self.send_json(HTTPStatus.OK, {"ok": True, "storage": "ready"})
            return
        if self.request_path in LEAD_PATHS:
            self.send_json(HTTPStatus.METHOD_NOT_ALLOWED, {"ok": False})
            return
        super().do_GET()

    def do_HEAD(self):
        if self.request_path in HEALTH_PATHS:
            self.send_json(HTTPStatus.OK, {"ok": True, "storage": "ready"})
            return
        if self.request_path in LEAD_PATHS:
            self.send_json(HTTPStatus.METHOD_NOT_ALLOWED, {"ok": False})
            return
        super().do_HEAD()

    def do_POST(self):
        if self.request_path not in LEAD_PATHS:
            self.send_json(HTTPStatus.NOT_FOUND, {"ok": False})
            return

        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            self.send_json(
                HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                {"ok": False, "message": "请使用正确的提交格式。"},
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        if content_length <= 0 or content_length > MAX_BODY_BYTES:
            self.send_json(
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                {"ok": False, "message": "提交内容过大。"},
            )
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            lead = validate_lead(payload)
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
            message = str(error) if isinstance(error, ValueError) else "提交内容格式不正确"
            self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "message": message})
            return

        try:
            created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            with connect_database(self.server.database_path) as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO leads
                        (name, company, phone, email, message, consent, created_at)
                    VALUES (?, ?, ?, ?, ?, 1, ?)
                    """,
                    (
                        lead["name"],
                        lead["company"],
                        lead["phone"],
                        lead["email"],
                        lead["message"],
                        created_at,
                    ),
                )
                lead_id = cursor.lastrowid
        except sqlite3.Error:
            self.log_error("Unable to store lead")
            self.send_json(
                HTTPStatus.SERVICE_UNAVAILABLE,
                {"ok": False, "message": "暂时无法保存，请稍后重试。"},
            )
            return

        self.send_json(
            HTTPStatus.CREATED,
            {"ok": True, "id": lead_id, "message": "提交成功，我们会尽快与您联系。"},
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4192)
    parser.add_argument("--database")
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    database_path = os.path.abspath(
        args.database or os.path.join(os.path.dirname(root), "data", "leads.sqlite3")
    )
    initialize_database(database_path)

    os.chdir(root)
    server = ThreadedHTTPServer((args.host, args.port), TokenVoltHandler)
    server.database_path = database_path
    print(
        "TokenVolt serving {} on {}:{}; leads stored in {}".format(
            root, args.host, args.port, database_path
        ),
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
