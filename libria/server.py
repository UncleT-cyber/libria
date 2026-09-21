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
import mimetypes
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

from .db import Database
from .sync import library_stats
try:
    from .supabase_client import get_db as get_supabase_db, is_supabase_configured
except ImportError:
    get_supabase_db = None  # type: ignore
    is_supabase_configured = lambda: False  # type: ignore

CORS_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
    ("Access-Control-Allow-Headers", "Content-Type, Range"),
]

GET_ROUTES = {"get_library", "get_library_stats", "get_settings", "get_downloads", "get_favorites"}
POST_ROUTES = {"scan_folder", "import_files", "import_spotify", "set_setting", "toggle_favorite"}


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

    def do_HEAD(self) -> None:  # for player pre-check (HEAD /api/audio/:id)
        if self.path == "/api/health":
            body = json.dumps({"status": "ok"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            for k, v in CORS_HEADERS:
                self.send_header(k, v)
            self.end_headers()
            return
        parts = urllib.parse.urlparse(self.path).path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "audio":
            # HEAD for audio - just check existence without body
            track_id = urllib.parse.unquote(parts[2])
            record = self._db().get_track(track_id)
            path = (record or {}).get("local_file_path")
            if not path or not Path(path).is_file():
                self._send_json({"error": "no local archive for track"}, status=404)
                return
            full_path = Path(path)
            mime = mimetypes.guess_type(full_path.name)[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(full_path.stat().st_size))
            for k, v in CORS_HEADERS:
                self.send_header(k, v)
            self.end_headers()
            return
        # fallback to GET handling for other HEADs
        self.do_GET()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self._send_json({"status": "ok"})
            return
        parts = urllib.parse.urlparse(self.path).path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "audio":
            self._send_audio(parts[2])
            return
        if len(parts) != 2 or parts[0] != "api" or parts[1] not in GET_ROUTES:
            self._send_json({"error": "unknown endpoint"}, status=404)
            return
        command = parts[1]
        try:
            if command == "get_library":
                self._send_json(self._db().all_tracks())
            elif command == "get_library_stats":
                self._send_json(library_stats(self._db()))
            elif command == "get_favorites":
                self._send_json(self._db().get_favorites())
            elif command == "get_settings":
                self._send_json(self._db().all_settings())
            elif command == "get_downloads":
                self._send_json(list(getattr(self.server, "download_status", {}).items()))
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)

    def _send_audio(self, raw_track_id: str) -> None:
        track_id = urllib.parse.unquote(raw_track_id)
        record = self._db().get_track(track_id)
        path = (record or {}).get("local_file_path")
        if not path or not Path(path).is_file():
            self._send_json({"error": "no local archive for track"}, status=404)
            return
        full_path = Path(path)
        total = full_path.stat().st_size
        mime = mimetypes.guess_type(full_path.name)[0] or "application/octet-stream"

        range_header = self.headers.get("Range")
        start, end = 0, total - 1
        status = 200
        if range_header and range_header.startswith("bytes="):
            span = range_header[len("bytes="):].split("-")
            try:
                if span[0]:
                    start = int(span[0])
                if len(span) > 1 and span[1]:
                    end = min(int(span[1]), total - 1)
            except ValueError:
                self._send_json({"error": "invalid Range"}, status=416)
                return
            if start >= total:
                self._send_json({"error": "range unsatisfiable"}, status=416)
                return
            status = 206

        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{total}")
        for key, value in CORS_HEADERS:
            self.send_header(key, value)
        self.end_headers()
        with open(full_path, "rb") as handle:
            handle.seek(start)
            remaining = length
            while remaining > 0:
                chunk = handle.read(min(65536, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)

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
            elif command == "import_spotify":
                self._handle_import_spotify(body)
            elif command == "set_setting":
                self._db().set_setting(body["key"], str(body["value"]))
                self._send_json({"key": body["key"], "value": str(body["value"])})
            elif command == "toggle_favorite":
                self._send_json({"favorites": self._db().toggle_favorite(body["track_id"])})
        except KeyError as exc:
            self._send_json({"error": f"missing field: {exc}"}, status=400)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)

    def _handle_import_spotify(self, body: dict) -> None:
        from . import spotify

        reference = spotify.parse_spotify_ref(body["url"])
        metadata = spotify.fetch_oembed(reference["url"])
        payload = spotify.track_payload(reference, metadata)
        track_id = self._db().upsert_track(payload)
        if reference["kind"] != "track":
            self._db().create_collection(payload["title"], "album" if reference["kind"] == "album" else "playlist")
        manager = getattr(self.server, "download_manager", None)
        enqueued = False
        if manager is not None and reference["kind"] == "track":
            manager.request_track(self._db().get_track(track_id) or payload, play_now=False)
            enqueued = True
        status_map = getattr(self.server, "download_status", None)
        if status_map is not None:
            status_map[track_id] = "queued" if enqueued else "stream-only"
        self._send_json({
            "track": self._db().get_track(track_id),
            "enqueued": enqueued,
            "metadata_resolved": bool(metadata),
        })

    def log_message(self, format, *args):  # keep server logs opt-in
        if getattr(self.server, "verbose", False):  # type: ignore[attr-defined]
            super().log_message(format, *args)


def create_server(db_path: Optional[str] = None, port: int = 12001,
                  download_manager=None, db: Optional[Database] = None) -> ThreadingHTTPServer:
    if db is None:
        # Render + Supabase: use Postgres when SUPABASE_URL is set, else SQLite
        if get_supabase_db is not None and is_supabase_configured():
            db = get_supabase_db()  # type: ignore
        else:
            db_location = db_path or str(Path.home() / ".libria" / "libria.db")
            Path(db_location).parent.mkdir(parents=True, exist_ok=True)
            db = Database(db_location)
    server = ThreadingHTTPServer(("0.0.0.0", port), ApiHandler)
    server.db = db  # type: ignore[attr-defined]
    server.download_manager = download_manager  # type: ignore[attr-defined]
    server.download_status = {}  # type: ignore[attr-defined]
    if download_manager is not None:
        def on_archived(track_id: str, path: str) -> None:
            server.download_status[track_id] = "downloaded"  # type: ignore[attr-defined]

        def on_error(job, exc: Exception) -> None:
            server.download_status[job.track_id] = "error"  # type: ignore[attr-defined]

        download_manager._on_track_archived = on_archived
        download_manager._on_error = on_error
    return server


def _build_download_manager(db: Database):
    """Background FIFO archival worker (spec section 7). Runs headless here:
    play routing goes through the Null backend while the queue still pulls
    media, tags it, and flips local_file_path NULL -> disk path."""
    from .audio_controller import AudioController, NullBackend
    from .downloader import PlaybackDownloadManager

    controller = AudioController(backend=NullBackend())
    return PlaybackDownloadManager(db=db, audio_controller=controller)


def main() -> None:
    import os
    import sys

    # Render injects PORT=10000; local dev uses 12001 or argv[1]
    port = int(os.getenv("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 12001))
    db_path = sys.argv[2] if len(sys.argv) > 2 else None
    # Prefer Supabase on Render/Vercel when env is set
    if get_supabase_db is not None and is_supabase_configured():
        db = get_supabase_db()  # type: ignore
    else:
        db_location = db_path or os.getenv("LIBRIA_DB_PATH") or str(Path.home() / ".libria" / "libria.db")
        Path(db_location).parent.mkdir(parents=True, exist_ok=True)
        db = Database(db_location)
    manager = None
    try:
        manager = _build_download_manager(db)
    except Exception as exc:  # queue is optional; API still serves without it
        print(f"download queue unavailable: {exc}")
    server = create_server(db_path if 'db_path' in locals() else None, port, download_manager=manager, db=db)
    print(f"libria API listening on :{port} (supabase={'on' if is_supabase_configured() else 'off'})")
    server.serve_forever()


if __name__ == "__main__":
    main()
