"""Spotify URL ingestion (master directive section 7 + user addendum).

Import contract: the user supplies a Spotify music URL (open.spotify.com or
a ``spotify:`` URI). The track row is created immediately with
``local_file_path = NULL`` (stream-only state); the archival queue then
pulls the media in the background and the post-download sync hook flips the
row to a local path, which the UI reflects as a cloud→downloaded icon swap.

URL forms accepted:
  https://open.spotify.com/track/<ID>[?si=...]      -> one track
  https://open.spotify.com/album/<ID>              -> album + collection
  https://open.spotify.com/playlist/<ID>           -> playlist + collection
  https://open.spotify.com/show/<ID>               -> podcast + collection
  spotify:track:<ID> / spotify:album:<ID> / spotify:playlist:<ID> / spotify:show:<ID>

Metadata fetching (oEmbed) is opportunistic: when unreachable the row is
still created so the queue can proceed, and the tagging step fills the
metadata from the downloaded media instead.
"""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request

from .db import normalize_track_id

SPOTIFY_HOST_RE = re.compile(r"^open\.spotify\.com$")
VALID_TYPES = {"track", "album", "playlist", "show", "podcast"}


def parse_spotify_ref(url: str) -> dict:
    """Classify a Spotify reference. Raises ValueError for non-Spotify input."""
    ref = url.strip()
    if ref.startswith("spotify:"):
        parts = ref.split(":")
        if len(parts) != 3 or parts[1] not in VALID_TYPES:
            raise ValueError(f"unsupported Spotify URI: {ref!r}")
        return {"kind": parts[1], "id": parts[2], "url": f"https://open.spotify.com/{parts[1]}/{parts[2]}"}

    parsed = urllib.parse.urlparse(ref)
    if not SPOTIFY_HOST_RE.match(parsed.netloc):
        raise ValueError(f"not a Spotify URL: {ref!r}")
    segments = [s for s in parsed.path.lstrip("/").split("/") if s]
    if not segments:
        raise ValueError(f"unrecognized Spotify URL: {ref!r}")
    kind = segments[0]
    if kind not in VALID_TYPES or len(segments) < 2:
        raise ValueError(f"unsupported Spotify entity: {ref!r}")
    return {"kind": kind, "id": segments[1], "url": ref}


def fetch_oembed(url: str, timeout: float = 5.0) -> dict:
    """Opportunistic title/artist/artwork lookup via the public oEmbed route.
    Any failure (offline, 404, malformed JSON) resolves to an empty mapping."""
    endpoint = "https://open.spotify.com/oembed?url=" + urllib.parse.quote(url, safe="")
    try:
        with urllib.request.urlopen(endpoint, timeout=timeout) as resp:
            payload = json.load(resp)
    except Exception:
        return {}
    return {
        "title": payload.get("title") or None,
        "artist": payload.get("artist") or None,
        "artwork_url": payload.get("thumbnail_url") or None,
    }


def track_payload(reference: dict, metadata: dict | None = None) -> dict:
    kind, sid = reference["kind"], reference["id"]
    meta = metadata or {}
    canonical_url = reference.get("url") or f"https://open.spotify.com/{kind}/{sid}"
    if kind == "track":
        return {
            "track_id": normalize_track_id(sid),
            "title": meta.get("title") or canonical_url,
            "artist": meta.get("artist") or "",
            "album": None,
            "spotify_url": canonical_url,
            "artwork_url": meta.get("artwork_url"),
        }
    # albums/playlists/shows import as a placeholder track row plus a collection
    display = meta.get("title") or f"Spotify {kind} {sid[:8]}"
    ctype = "album" if kind == "album" else "playlist"
    return {
        "track_id": normalize_track_id(f"{kind}:{sid}"),
        "title": display,
        "artist": meta.get("artist") or "Spotify",
        "album": display if kind == "album" else None,
        "spotify_url": canonical_url,
        "artwork_url": meta.get("artwork_url"),
    }
