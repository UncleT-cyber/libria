from http.server import BaseHTTPRequestHandler
from api._lib import json_response

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        json_response(self, {"status": "ok", "supabase": bool(__import__("os").getenv("SUPABASE_URL") or __import__("os").getenv("VITE_SUPABASE_URL"))})
    def do_OPTIONS(self):
        self.send_response(204)
        from api._lib import cors_headers
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
