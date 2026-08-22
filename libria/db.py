"""SQLite persistence layer for Libria.

Schema constraints (spec section 1):
  - ``PRAGMA foreign_keys = ON`` is executed on every connection init.
  - ``tracks`` is keyed by a normalized Spotify track ID and stays decoupled
    from the local filesystem via a nullable ``local_file_path``.
  - ``favorites`` is a strict 1:1 linked table (no boolean flag on tracks).
  - ``collections`` + ``collection_tracks`` form a junction framework across
    multi-type groupings: album, playlist, genre_mix.
  - ``app_settings`` is an atomic key-value ledger for config mutations.

The background downloader worker and the UI share one connection, so a
re-entrant lock guards all writes (sqlite3 connects with
``check_same_thread=False``).
"""
from __future__ import annotations

import sqlite3
import threading
from pathlib import Path
from typing import Iterable, Optional

COLLECTION_TYPES = ("album", "playlist", "genre_mix")

SCHEMA = """
CREATE TABLE IF NOT EXISTS tracks (
    track_id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    artist TEXT NOT NULL DEFAULT '',
    album TEXT,
    year INTEGER,
    duration_ms INTEGER,
    spotify_url TEXT,
    artwork_url TEXT,
    lyrics TEXT,
    local_file_path TEXT
);
CREATE TABLE IF NOT EXISTS favorites (
    track_id TEXT PRIMARY KEY REFERENCES tracks(track_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS collections (
    collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('album', 'playlist', 'genre_mix')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS collection_tracks (
    collection_id INTEGER NOT NULL REFERENCES collections(collection_id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(track_id) ON DELETE CASCADE,
    position INTEGER,
    PRIMARY KEY (collection_id, track_id)
);
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

_SPOTIFY_PREFIX = "spotify:track:"


def normalize_track_id(ref: str) -> str:
    """Reduce a Spotify track reference (bare ID, ``spotify:track:`` URI, or
    open.spotify.com URL) to the canonical bare ID used as primary key."""
    ref = ref.strip()
    if ref.startswith(_SPOTIFY_PREFIX):
        return ref[len(_SPOTIFY_PREFIX):]
    if "open.spotify.com/track/" in ref:
        slug = ref.split("open.spotify.com/track/", 1)[1]
        slug = slug.split("?", 1)[0].split("/", 1)[0]
        return slug
    return ref


class Database:
    def __init__(self, path: str | Path):
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(str(path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        # Foreign-key enforcement is never optional on this connection.
        self._conn.execute("PRAGMA foreign_keys = ON;")
        self.initialize_schema()

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    def initialize_schema(self) -> None:
        with self._lock:
            self._conn.executescript(SCHEMA)
            self._conn.commit()

    # -- tracks ------------------------------------------------------
    def upsert_track(self, track: dict) -> str:
        track_id = normalize_track_id(track["track_id"])
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO tracks "
                "(track_id, title, artist, album, year, duration_ms, spotify_url, artwork_url, lyrics, local_file_path) "
                "VALUES (?,?,?,?,?,?,?,?,?, COALESCE(?, (SELECT local_file_path FROM tracks WHERE track_id=?)))",
                (
                    track_id,
                    track.get("title", ""),
                    track.get("artist", ""),
                    track.get("album"),
                    track.get("year"),
                    track.get("duration_ms"),
                    track.get("spotify_url") or track.get("url"),
                    track.get("artwork_url"),
                    track.get("lyrics"),
                    track.get("local_file_path"),
                    track_id,
                ),
            )
            self._conn.commit()
        return track_id

    def get_track(self, track_id: str) -> Optional[dict]:
        with self._lock:
            row = self._conn.execute(
                "SELECT * FROM tracks WHERE track_id=?",
                (normalize_track_id(track_id),),
            ).fetchone()
        return dict(row) if row else None

    def all_tracks(self) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM tracks ORDER BY artist, album, title"
            ).fetchall()
        return [dict(r) for r in rows]

    def set_local_file_path(self, track_id: str, path: str) -> None:
        with self._lock:
            self._conn.execute(
                "UPDATE tracks SET local_file_path=? WHERE track_id=?",
                (path, normalize_track_id(track_id)),
            )
            self._conn.commit()

    # -- favorites (1:1 linked) --------------------------------------
    def add_favorite(self, track_id: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR IGNORE INTO favorites (track_id) VALUES (?)",
                (normalize_track_id(track_id),),
            )
            self._conn.commit()

    def remove_favorite(self, track_id: str) -> None:
        with self._lock:
            self._conn.execute(
                "DELETE FROM favorites WHERE track_id=?",
                (normalize_track_id(track_id),),
            )
            self._conn.commit()

    def is_favorite(self, track_id: str) -> bool:
        with self._lock:
            row = self._conn.execute(
                "SELECT 1 FROM favorites WHERE track_id=?",
                (normalize_track_id(track_id),),
            ).fetchone()
        return row is not None

    def favorite_tracks(self) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT t.* FROM tracks t JOIN favorites f ON f.track_id = t.track_id "
                "ORDER BY t.artist, t.album, t.title"
            ).fetchall()
        return [dict(r) for r in rows]

    # -- collections (album / playlist / genre_mix junction) ---------
    def create_collection(self, name: str, ctype: str) -> int:
        with self._lock:
            cur = self._conn.execute(
                "INSERT INTO collections (name, type) VALUES (?,?)", (name, ctype)
            )
            self._conn.commit()
            return int(cur.lastrowid)

    def list_collections(self, ctype: Optional[str] = None) -> list[dict]:
        query = "SELECT * FROM collections"
        args: Iterable = ()
        if ctype:
            query += " WHERE type=?"
            args = (ctype,)
        query += " ORDER BY name"
        with self._lock:
            rows = self._conn.execute(query, tuple(args)).fetchall()
        return [dict(r) for r in rows]

    def add_to_collection(self, collection_id: int, track_id: str,
                          position: Optional[int] = None) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO collection_tracks (collection_id, track_id, position) "
                "VALUES (?,?,?)",
                (collection_id, normalize_track_id(track_id), position),
            )
            self._conn.commit()

    def remove_from_collection(self, collection_id: int, track_id: str) -> None:
        with self._lock:
            self._conn.execute(
                "DELETE FROM collection_tracks WHERE collection_id=? AND track_id=?",
                (collection_id, normalize_track_id(track_id)),
            )
            self._conn.commit()

    def collection_tracks(self, collection_id: int) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT t.* FROM tracks t "
                "JOIN collection_tracks ct ON ct.track_id = t.track_id "
                "WHERE ct.collection_id=? ORDER BY ct.position",
                (collection_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    # -- app_settings ledger ------------------------------------------
    def set_setting(self, key: str, value) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?,?)",
                (key, str(value)),
            )
            self._conn.commit()

    def get_setting(self, key: str, default: Optional[str] = None) -> Optional[str]:
        with self._lock:
            row = self._conn.execute(
                "SELECT value FROM app_settings WHERE key=?", (key,)
            ).fetchone()
        return row["value"] if row else default

    def all_settings(self) -> dict:
        with self._lock:
            rows = self._conn.execute("SELECT key, value FROM app_settings").fetchall()
        return {r["key"]: r["value"] for r in rows}
