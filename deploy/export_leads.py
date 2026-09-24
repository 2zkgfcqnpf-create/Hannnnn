#!/usr/bin/env python3
"""Export TokenVolt leads from the private SQLite database as UTF-8 CSV."""

import argparse
import csv
import sqlite3
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("database", help="Path to leads.sqlite3")
    parser.add_argument("--output", help="CSV output path; defaults to standard output")
    args = parser.parse_args()

    output = open(args.output, "w", newline="", encoding="utf-8-sig") if args.output else sys.stdout
    try:
        database_uri = "file:{}?mode=ro".format(args.database)
        with sqlite3.connect(database_uri, uri=True) as connection:
            rows = connection.execute(
                """
                SELECT id, name, company, phone, email, message, status, created_at
                FROM leads
                ORDER BY id DESC
                """
            )
            writer = csv.writer(output)
            writer.writerow(["编号", "姓名", "公司", "电话", "邮箱", "需求说明", "状态", "提交时间(UTC)"])
            writer.writerows(rows)
    finally:
        if args.output:
            output.close()


if __name__ == "__main__":
    main()
