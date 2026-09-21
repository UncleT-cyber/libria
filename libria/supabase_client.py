"""Supabase adapter for Libria. Mirrors libria/db.py Database surface but uses Postgres via supabase-py.

Usage:
    from libria.supabase_client import get_db
    db = get_db()  # returns SupabaseDatabase if SUPABASE_URL set, else SQLite Database

Env:
    SUPABASE_URL / VITE_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from .db import SEED_SETTINGS, Database as SQLiteDatabase, normalize_track_id

try:
    from supabase import create_client, Client  # type: ignore
except ImportError:
    Client = None  # type: ignore
    create_client = None  # type: ignore


def _supabase_env() -> tuple[str | None, str | None]:
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
    return url, key


def is_supabase_configured() -> bool:
    url, key = _supabase_env()
    return bool(url and key and create_client is not None)


class SupabaseDatabase:
    """Postgres-backed drop-in for libria.db.Database. No local file locking needed."""

    def __init__(self, url: str | None = None, key: str | None = None):
        if create_client is None:
            raise RuntimeError("supabase package not installed. pip install supabase python-dotenv")
        env_url, env_key = _supabase_env()
        url = url or env_url
        key = key or env_key
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        self.client: Client = create_client(url, key)

    # -- tracks ------------------------------------------------------
    def upsert_track(self, track: dict) -> str:
        track_id = normalize_track_id(track["track_id"])
        payload = {
            "track_id": track_id,
            "title": track.get("title", ""),
            "artist": track.get("artist", ""),
            "album": track.get("album"),
            "year": track.get("year"),
            "duration_ms": track.get("duration_ms"),
            "spotify_url": track.get("spotify_url") or track.get("url"),
            "artwork_url": track.get("artwork_url"),
            "lyrics": track.get("lyrics"),
            "local_file_path": track.get("local_file_path"),
        }
        # upsert - keep existing local_file_path if new is null
        existing = self.get_track(track_id)
        if existing and not payload["local_file_path"]:
            payload["local_file_path"] = existing.get("local_file_path")
        self.client.table("tracks").upsert(payload, on_conflict="track_id").execute()
        return track_id

    def get_track(self, track_id: str) -> Optional[dict]:
        tid = normalize_track_id(track_id)
        res = self.client.table("tracks").select("*").eq("track_id", tid).limit(1).execute()
        return dict(res.data[0]) if res.data else None

    def all_tracks(self) -> list[dict]:
        res = self.client.table("tracks").select("*").order("artist").order("album").order("title").execute()
        return list(res.data or [])

    def set_local_file_path(self, track_id: str, path: str) -> None:
        self.client.table("tracks").update({"local_file_path": path}).eq("track_id", normalize_track_id(track_id)).execute()

    # -- favorites ---------------------------------------------------
    def add_favorite(self, track_id: str) -> None:
        self.client.table("favorites").upsert({"track_id": normalize_track_id(track_id)}, on_conflict="track_id").execute()

    def remove_favorite(self, track_id: str) -> None:
        self.client.table("favorites").delete().eq("track_id", normalize_track_id(track_id)).execute()

    def is_favorite(self, track_id: str) -> bool:
        res = self.client.table("favorites").select("track_id").eq("track_id", normalize_track_id(track_id)).limit(1).execute()
        return bool(res.data)

    def toggle_favorite(self, track_id: str) -> list[str]:
        if self.is_favorite(track_id):
            self.remove_favorite(track_id)
        else:
            self.add_favorite(track_id)
        return self.get_favorites()

    def get_favorites(self) -> list[str]:
        res = self.client.table("favorites").select("track_id").execute()
        return [r["track_id"] for r in (res.data or [])]

    def favorite_tracks(self) -> list[dict]:
        # join via two queries (supabase postgrest join syntax)
        favs = self.get_favorites()
        if not favs:
            return []
        res = self.client.table("tracks").select("*").in_("track_id", favs).execute()
        return list(res.data or [])

    # -- collections -------------------------------------------------
    def create_collection(self, name: str, ctype: str) -> int:
        res = self.client.table("collections").insert({"name": name, "type": ctype}).select("collection_id").execute()
        return int(res.data[0]["collection_id"]) if res.data else 0

    def list_collections(self, ctype: Optional[str] = None) -> list[dict]:
        q = self.client.table("collections").select("*").order("name")
        if ctype:
            q = q.eq("type", ctype)
        res = q.execute()
        return list(res.data or [])

    def add_to_collection(self, collection_id: int, track_id: str, position: Optional[int] = None) -> None:
        self.client.table("collection_tracks").upsert(
            {"collection_id": collection_id, "track_id": normalize_track_id(track_id), "position": position},
            on_conflict="collection_id,track_id",
        ).execute()

    def remove_from_collection(self, collection_id: int, track_id: str) -> None:
        self.client.table("collection_tracks").delete().eq("collection_id", collection_id).eq("track_id", normalize_track_id(track_id)).execute()

    def collection_tracks(self, collection_id: int) -> list[dict]:
        res = self.client.table("collection_tracks").select("track_id").eq("collection_id", collection_id).order("position").execute()
        tids = [r["track_id"] for r in (res.data or [])]
        if not tids:
            return []
        t_res = self.client.table("tracks").select("*").in_("track_id", tids).execute()
        # preserve order by position
        by_id = {t["track_id"]: t for t in (t_res.data or [])}
        return [by_id[tid] for tid in tids if tid in by_id]

    # -- app_settings ------------------------------------------------
    def set_setting(self, key: str, value) -> None:
        self.client.table("app_settings").upsert({"key": key, "value": str(value)}, on_conflict="key").execute()

    def get_setting(self, key: str, default: Optional[str] = None) -> Optional[str]:
        res = self.client.table("app_settings").select("value").eq("key", key).limit(1).execute()
        return res.data[0]["value"] if res.data else default

    def all_settings(self) -> dict:
        res = self.client.table("app_settings").select("key,value").execute()
        return {r["key"]: r["value"] for r in (res.data or [])}

    def close(self) -> None:
        pass

    def initialize_schema(self) -> None:
        pass


def get_db(path: str | Path | None = None):
    """Factory: Supabase if env configured, else SQLite at path / ~/.libria/libria.db"""
    if is_supabase_configured():
        return SupabaseDatabase()
    db_path = path or os.getenv("LIBRIA_DB_PATH") or str(Path.home() / ".libria" / "libria.db")
    Path(str(db_path)).parent.mkdir(parents=True, exist_ok=True)
    return SQLiteDatabase(db_path)
