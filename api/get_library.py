from http.server import BaseHTTPRequestHandler
from api._lib import json_response, get_db, cors_headers

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            db = get_db()
            tracks = db.all_tracks()
            json_response(self, tracks)
        except Exception as e:
            json_response(self, {"error": str(e)}, status=500)
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
