"""HTTP API bridge for the web frontend.

Mirrors the command surface the React app expects from the Tauri backend
(``get_library``, ``scan_folder``, ``import_files``, ``get_library_stats``)
so that the UI works identically inside the desktop shell and in a plain
browser. Endpoints mirror the invoke argument layout exactly:

  POST /api/scan_folder     {"folderPath": "/path/to/dir"}  -> {"added": n}
  POST /api/import_files    {"filePaths": ["/a.mp3", ...]}  -> {"added": n}
  GET  /api/get_library                                          -> [tracks]
  GET  /api/get_library_stats                            -> {total_*: int}
  GET  /api/health                                                       -> ok
"""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

from .db import Database
from .sync import library_stats

CORS_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
    ("Access-Control-Allow-Headers", "Content-Type"),
]

GET_ROUTES = {"get_library", "get_library_stats"}
POST_ROUTES = {"scan_folder", "import_files"}


class ApiHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for key, value in CORS_HEADERS:
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def _db(self) -> Database:
        return self.server.db  # type: ignore[attr-defined]

    def do_OPTIONS(self) -> None:  # CORS preflight
        self.send_response(204)
        for key, value in CORS_HEADERS:
            self.send_header(key, value)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self._send_json({"status": "ok"})
            return
        parts = self.path.strip("/").split("/")
        if len(parts) != 2 or parts[0] != "api" or parts[1] not in GET_ROUTES:
            self._send_json({"error": "unknown endpoint"}, status=404)
            return
        command = parts[1]
        try:
            if command == "get_library":
                self._send_json(self._db().all_tracks())
            elif command == "get_library_stats":
                self._send_json(library_stats(self._db()))
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)

    def do_POST(self) -> None:
        parts = self.path.strip("/").split("/")
        if len(parts) != 2 or parts[0] != "api" or parts[1] not in POST_ROUTES:
            self._send_json({"error": "unknown endpoint"}, status=404)
            return
        command = parts[1]
        length = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._send_json({"error": "invalid JSON body"}, status=400)
            return
        try:
            if command == "scan_folder":
                from . import sync

                added = sync.scan_folder(self._db(), body["folderPath"])
                self._send_json({"added": added, "folderPath": body["folderPath"]})
            elif command == "import_files":
                from . import sync

                paths = body.get("filePaths") or []
                added = sync.import_files(self._db(), paths)
                self._send_json({"added": added, "filePaths": paths})
        except KeyError as exc:
            self._send_json({"error": f"missing field: {exc}"}, status=400)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)

    def log_message(self, format, *args):  # keep server logs opt-in
        if getattr(self.server, "verbose", False):  # type: ignore[attr-defined]
            super().log_message(format, *args)


def create_server(db_path: Optional[str] = None, port: int = 12001) -> ThreadingHTTPServer:
    db_location = db_path or str(Path.home() / ".libria" / "libria.db")
    Path(db_location).parent.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", port), ApiHandler)
    server.db = Database(db_location)  # type: ignore[attr-defined]
    return server


def main() -> None:
    import sys

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 12001
    db_path = sys.argv[2] if len(sys.argv) > 2 else None
    server = create_server(db_path, port)
    print(f"libria API listening on :{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
