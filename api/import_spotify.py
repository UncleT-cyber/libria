from http.server import BaseHTTPRequestHandler
import json
from api._lib import json_response, get_db, cors_headers

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            json_response(self, {"error": "invalid JSON"}, status=400)
            return
        url = body.get("url") or body.get("spotify_url")
        if not url:
            json_response(self, {"error": "missing url"}, status=400)
            return
        try:
            from libria import spotify
            db = get_db()
            ref = spotify.parse_spotify_ref(url)
            meta = spotify.fetch_oembed(ref["url"])
            payload = spotify.track_payload(ref, meta)
            track_id = db.upsert_track(payload)
            if ref["kind"] != "track":
                try:
                    db.create_collection(payload["title"], "album" if ref["kind"] == "album" else "playlist")
                except Exception:
                    pass
            json_response(self, {"track": db.get_track(track_id), "enqueued": False, "metadata_resolved": bool(meta)})
        except ValueError as e:
            json_response(self, {"error": str(e)}, status=400)
        except Exception as e:
            json_response(self, {"error": str(e)}, status=500)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
