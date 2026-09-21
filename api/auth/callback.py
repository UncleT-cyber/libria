"""GET /api/auth/callback?code=... -> exchange code for tokens, store in Supabase app_settings"""
from http.server import BaseHTTPRequestHandler
import os
import json
import urllib.parse
import urllib.request
import base64

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        code = (params.get("code") or [None])[0]
        error = (params.get("error") or [None])[0]
        if error:
            self._json({"error": error}, 400)
            return
        if not code:
            self._json({"error": "missing code"}, 400)
            return

        client_id = os.getenv("SPOTIFY_CLIENT_ID") or ""
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET") or ""
        redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI")
        if not redirect_uri:
            proto = self.headers.get("X-Forwarded-Proto", "https")
            host = self.headers.get("Host") or "localhost:5173"
            redirect_uri = f"{proto}://{host}/callback"
            if "vercel.app" not in host and os.getenv("VERCEL_URL"):
                redirect_uri = f"https://{os.getenv('VERCEL_URL')}/callback"

        if not client_id or not client_secret:
            self._json({"error": "SPOTIFY_CLIENT_ID/SECRET not configured"}, 500)
            return

        # exchange code -> tokens
        data = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }).encode()
        creds = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        req = urllib.request.Request("https://accounts.spotify.com/api/token", data=data, headers={
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/x-www-form-urlencoded",
        })
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                tokens = json.load(resp)
        except Exception as e:
            self._json({"error": f"token exchange failed: {e}"}, 502)
            return

        # store in Supabase app_settings (or SQLite fallback)
        try:
            from api._lib import get_db
            db = get_db()
            db.set_setting("SPOTIFY_ACCESS_TOKEN", tokens.get("access_token",""))
            if tokens.get("refresh_token"):
                db.set_setting("SPOTIFY_REFRESH_TOKEN", tokens["refresh_token"])
            if tokens.get("expires_in"):
                db.set_setting("SPOTIFY_TOKEN_EXPIRES_AT", str(tokens["expires_in"]))
        except Exception:
            pass  # don't fail callback on DB error

        # redirect back to frontend with success fragment (hash not sent to server)
        # use query param for simplicity
        frontend = redirect_uri.replace("/callback","")
        # if Vercel URL was used, redirect to that host's root
        self.send_response(302)
        self.send_header("Location", f"{frontend}/?spotify_connected=1")
        self.end_headers()

    def _json(self, payload, status=200):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
