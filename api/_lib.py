"""Shared helpers for Vercel Python serverless functions."""
from __future__ import annotations

import json
import os


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range, Authorization",
        "Content-Type": "application/json",
    }


def json_response(handler, payload, status=200):
    body = json.dumps(payload).encode()
    handler.send_response(status)
    for k, v in cors_headers().items():
        handler.send_header(k, v)
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def get_db():
    """Supabase if env configured, else in-memory SQLite fallback (read-only on Vercel)."""
    # lazy import so Vercel cold start doesn't fail if supabase not installed locally
    try:
        from libria.supabase_client import get_db as _get_db
        return _get_db()
    except Exception as e:
        # fallback to SQLite tmp (Vercel filesystem is read-only except /tmp)
        from libria.db import Database
        import tempfile
        from pathlib import Path
        tmp = Path(tempfile.gettempdir()) / "libria.db"
        return Database(str(tmp))
