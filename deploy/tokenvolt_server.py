#!/usr/bin/env python3
"""Small threaded static server for the TokenVolt deployment."""

import argparse
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128

    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(30)
        return connection, address


class TokenVoltHandler(SimpleHTTPRequestHandler):
    server_version = "TokenVoltStatic/1.0"

    def end_headers(self):
        if self.path.endswith((".png", ".svg", ".css", ".js")):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, format, *args):
        super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4192)
    args = parser.parse_args()

    os.chdir(args.root)
    server = ThreadedHTTPServer((args.host, args.port), TokenVoltHandler)
    print("TokenVolt serving {} on {}:{}".format(args.root, args.host, args.port), flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
