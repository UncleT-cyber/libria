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
        key = body.get("key")
        if not key:
            json_response(self, {"error": "missing key"}, status=400)
            return
        try:
            db = get_db()
            db.set_setting(key, str(body.get("value","")))
            json_response(self, {"key": key, "value": str(body.get("value",""))})
        except Exception as e:
            json_response(self, {"error": str(e)}, status=500)
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
