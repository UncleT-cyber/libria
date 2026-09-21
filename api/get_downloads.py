from http.server import BaseHTTPRequestHandler
from api._lib import json_response, cors_headers

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        json_response(self, [])  # Vercel has no persistent queue; use Supabase for status
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
