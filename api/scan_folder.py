from http.server import BaseHTTPRequestHandler
import json
from api._lib import json_response, cors_headers

# scan_folder is filesystem-only and not supported on Vercel's read-only filesystem
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        json_response(self, {"error": "scan_folder not supported on Vercel - use Supabase Storage upload or Tauri desktop. See libria/sync.py for local use."}, status=501)
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
