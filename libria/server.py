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

import logging
import json
import mimetypes
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

from .db import Database
from .sync import library_stats

logger = logging.getLogger(__name__)

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
POST_ROUTES = {"scan_folder", "import_files", "import_spotify", "create_playlist", "add_to_playlist", "set_setting", "toggle_favorite", "play_track", "fetch_lyrics"}


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
            elif command == "create_playlist":
                self._handle_create_playlist(body)
            elif command == "add_to_playlist":
                self._handle_add_to_playlist(body)
            elif command == "fetch_lyrics":
                self._handle_fetch_lyrics(body)
            elif command == "set_setting":
                self._db().set_setting(body["key"], str(body["value"]))
                self._send_json({"key": body["key"], "value": str(body["value"])})
            elif command == "toggle_favorite":
                self._send_json({"favorites": self._db().toggle_favorite(body["track_id"])})
            elif command == "play_track":
                track_id = body.get("track_id") or body.get("trackId")
                if not track_id:
                    self._send_json({"error": "missing track_id"}, status=400)
                    return
                track = self._db().get_track(track_id)
                if not track:
                    self._send_json({"error": "track not found"}, status=404)
                    return
                # Auto-download on first stream: if no local file, enqueue via ytsearch and return queued
                path = track.get("local_file_path")
                is_archived = bool(path and Path(path).is_file())
                manager = getattr(self.server, "download_manager", None)
                status_map = getattr(self.server, "download_status", None)
                if not is_archived and manager is not None:
                    manager.request_track(track, play_now=False)
                    if status_map is not None:
                        status_map[track_id] = "queued"
                    # poll briefly for fast cache (yt-dlp may finish in seconds)
                    import time
                    for _ in range(30):
                        time.sleep(0.5)
                        fresh = self._db().get_track(track_id)
                        fp = (fresh or {}).get("local_file_path")
                        if fp and Path(fp).is_file():
                            track = fresh
                            is_archived = True
                            break
                        st = (status_map or {}).get(track_id) if status_map is not None else None
                        if st == "error":
                            break
                self._send_json({
                    "track": self._db().get_track(track_id),
                    "archived": is_archived,
                    "audio_url": f"/api/audio/{track_id}" if is_archived else None,
                    "status": (status_map or {}).get(track_id) if status_map is not None else None,
                })
        except KeyError as exc:
            self._send_json({"error": f"missing field: {exc}"}, status=400)
        except Exception as exc:
            self._send_json({"error": str(exc)}, status=500)

    def _handle_import_spotify(self, body: dict) -> None:
        from . import spotify
        from .lyrics import fetch_lyrics

        reference = spotify.parse_spotify_ref(body["url"])
        metadata = spotify.fetch_oembed(reference["url"])
        payload = spotify.track_payload(reference, metadata)
        track_id = self._db().upsert_track(payload)
        manager = getattr(self.server, "download_manager", None)
        enqueued = False
        collection_id = None

        if reference["kind"] == "album":
            collection_id = self._db().create_collection(payload["title"], "album")
            album_name = payload["title"]
            album_track = dict(payload)
            album_track["album"] = album_name
            self._db().upsert_track(album_track)
            if manager is not None:
                manager.request_track(album_track, play_now=False)
                enqueued = True
            try:
                track_list = self._fetch_spotify_album_tracks(reference["id"])
                if track_list:
                    for t in track_list:
                        artist_name = t["artists"][0]["name"] if t.get("artists") else "Unknown"
                        t_payload = {
                            "track_id": spotify.normalize_track_id(t["id"]),
                            "title": t["name"],
                            "artist": artist_name,
                            "album": album_name,
                            "spotify_url": f"https://open.spotify.com/track/{t['id']}",
                            "artwork_url": metadata.get("artwork_url"),
                        }
                        t_id = self._db().upsert_track(t_payload)
                        self._db().add_to_collection(collection_id, t_id)
                        if manager is not None:
                            manager.request_track(self._db().get_track(t_id) or t_payload, play_now=False)
                            enqueued = True
                    status = "album_queued" if enqueued else "album_created"
                else:
                    status = "album_queued" if enqueued else "album_created"
            except Exception as exc:
                logger.warning("Failed to fetch album tracks: %s", exc)
                status = "album_queued" if enqueued else "album_created"
        elif reference["kind"] == "playlist":
            collection_id = self._db().create_collection(payload["title"], "playlist")
            try:
                track_list = self._fetch_spotify_playlist_tracks(reference["id"])
                if track_list:
                    for t in track_list:
                        artist_name = t["track"]["artists"][0]["name"] if t.get("track", {}).get("artists") else "Unknown"
                        t_payload = {
                            "track_id": spotify.normalize_track_id(t["track"]["id"]),
                            "title": t["track"]["name"],
                            "artist": artist_name,
                            "album": None,
                            "spotify_url": f"https://open.spotify.com/track/{t['track']['id']}",
                            "artwork_url": metadata.get("artwork_url"),
                        }
                        t_id = self._db().upsert_track(t_payload)
                        self._db().add_to_collection(collection_id, t_id)
                        if manager is not None:
                            manager.request_track(self._db().get_track(t_id) or t_payload, play_now=False)
                            enqueued = True
                    status = "playlist_queued" if enqueued else "playlist_created"
                else:
                    status = "playlist_created"
            except Exception as exc:
                logger.warning("Failed to fetch playlist tracks: %s", exc)
                status = "playlist_created"
        elif reference["kind"] in ("show", "podcast"):
            collection_id = self._db().create_collection(payload["title"], "playlist")
            status = "podcast_created"
        else:
            if manager is not None:
                manager.request_track(self._db().get_track(track_id) or payload, play_now=False)
                enqueued = True
            status = "queued" if enqueued else "stream-only"

        if metadata.get("title") and metadata.get("artist"):
            lyrics = fetch_lyrics(metadata["title"], metadata["artist"])
            if lyrics:
                updated = self._db().get_track(track_id) or payload
                updated["lyrics"] = lyrics
                self._db().upsert_track(updated)

        status_map = getattr(self.server, "download_status", None)
        if status_map is not None:
            status_map[track_id] = status
        self._send_json({
            "track": self._db().get_track(track_id),
            "collection_id": collection_id,
            "enqueued": enqueued,
            "metadata_resolved": bool(metadata),
            "status": status,
        })

    def _handle_create_playlist(self, body: dict) -> None:
        name = body.get("name") or body.get("playlist_name")
        if not name:
            self._send_json({"error": "missing name"}, status=400)
            return
        collection_id = self._db().create_collection(name, "playlist")
        self._send_json({"collection_id": collection_id, "name": name})

    def _handle_add_to_playlist(self, body: dict) -> None:
        collection_id = body.get("collection_id")
        track_id = body.get("track_id") or body.get("trackId")
        if not collection_id or not track_id:
            self._send_json({"error": "missing collection_id or track_id"}, status=400)
            return
        self._db().add_to_collection(collection_id, track_id)
        self._send_json({"success": True})

    def _handle_fetch_lyrics(self, body: dict) -> None:
        from .lyrics import fetch_lyrics
        title = body.get("title")
        artist = body.get("artist")
        if not title or not artist:
            self._send_json({"error": "missing title or artist"}, status=400)
            return
        lyrics = fetch_lyrics(title, artist)
        self._send_json({"lyrics": lyrics})

    def _fetch_spotify_album_tracks(self, album_id: str) -> list:
        """Fetch album tracks via the Spotify oEmbed/OpenGraph API."""
        import json
        import urllib.request
        url = f"https://api.spotify.com/v1/albums/{album_id}/tracks"
        try:
            req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.load(resp)
            return data.get("items", [])
        except Exception:
            # Fallback: return empty list, will use oEmbed metadata
            return []

    def _fetch_spotify_playlist_tracks(self, playlist_id: str) -> list:
        """Fetch playlist tracks via the Spotify API."""
        import json
        import urllib.request
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        try:
            req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.load(resp)
            return data.get("items", [])
        except Exception:
            return []

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
    port_arg = None
    for arg in sys.argv[1:]:
        if arg.startswith("--port="):
            port_arg = arg.split("=")[1]
        elif not arg.startswith("--") and port_arg is None:
            port_arg = arg
    port = int(os.getenv("PORT") or port_arg or 12001)
    db_path = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].startswith("--") else None
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
