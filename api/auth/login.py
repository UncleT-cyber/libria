"""GET /api/auth/login -> redirect to Spotify authorize"""
from http.server import BaseHTTPRequestHandler
import os
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        client_id = os.getenv("SPOTIFY_CLIENT_ID") or os.getenv("VITE_SPOTIFY_CLIENT_ID") or ""
        # prefer explicit REDIRECT_URI, else infer from request host
        redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI")
        if not redirect_uri:
            proto = self.headers.get("X-Forwarded-Proto", "https")
            host = self.headers.get("Host") or self.headers.get("X-Forwarded-Host") or "localhost:5173"
            redirect_uri = f"{proto}://{host}/callback"
            # Vercel frontend callback is preferred
            if "vercel.app" not in host and os.getenv("VERCEL_URL"):
                redirect_uri = f"https://{os.getenv('VERCEL_URL')}/callback"
        if not client_id:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error":"SPOTIFY_CLIENT_ID not configured in Vercel env"}')
            return
        qs = urllib.parse.urlencode({
            "client_id": client_id,
            "response_type": "code",
            "redirect_uri": redirect_uri,
            "scope": "user-library-read playlist-read-private user-read-email",
            "show_dialog": "false",
        })
        self.send_response(302)
        self.send_header("Location", f"https://accounts.spotify.com/authorize?{qs}")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
