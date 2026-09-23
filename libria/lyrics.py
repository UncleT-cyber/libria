"""Lyrics fetching via public lyric APIs.

Uses LRCLIB (https://lrclib.net) as the primary source. Falls back to
a raw HTTP search if the primary endpoint is unavailable.
"""
from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request
from typing import Optional

logger = logging.getLogger(__name__)

LRCLIB_SEARCH = "https://lrclib.net/api/search?q={query}"
LRCLIB_GET = "https://lrclib.net/api/get?artist_name={artist}&track_name={title}"
LRCLIB_BY_ID = "https://lrclib.net/api/get/{track_id}"


def fetch_lyrics(title: str, artist: str) -> Optional[str]:
    """Fetch lyrics for a track. Returns None on any failure. Tries get then search."""
    if not title or not artist:
        return None
    # Try direct get first (more accurate)
    try:
        url = LRCLIB_GET.format(artist=urllib.parse.quote(artist, safe=""), title=urllib.parse.quote(title, safe=""))
        with urllib.request.urlopen(url, timeout=8) as resp:
            data = json.load(resp)
            if isinstance(data, dict) and data.get("plainLyrics"):
                return data.get("plainLyrics") or data.get("syncedLyrics")
            if isinstance(data, dict) and data.get("lyrics"):
                return data.get("lyrics")
    except Exception:
        pass
    query = f"{artist} {title}"
    url = LRCLIB_SEARCH.format(query=urllib.parse.quote(query, safe=""))
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            results = json.load(resp)
        # search returns list
        if isinstance(results, list) and results:
            first = results[0]
            return first.get("plainLyrics") or first.get("syncedLyrics") or first.get("lyrics")
        if isinstance(results, dict) and results.get("data"):
            data = results["data"]
            if isinstance(data, list) and data:
                return data[0].get("plainLyrics") or data[0].get("lyrics")
            if isinstance(data, dict) and data.get("lyrics"):
                return data.get("lyrics")
    except Exception as e:
        logger.debug("lrclib fetch failed for %r: %s", query, e)
    return None


def fetch_lyrics_by_id(track_id: str) -> Optional[str]:
    """Fetch lyrics by LRCLIB track ID."""
    url = LRCLIB_BY_ID.format(track_id=track_id)
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            data = json.load(resp)
        return data.get("lyrics")
    except Exception:
        return None
