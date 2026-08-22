"""Library synchronization: folder scanning and file import.

Audio files discovered on disk are upserted into the ``tracks`` table with
their ``local_file_path`` set, so the player resolves them zero-buffer and
the downloads view immediately reflects archived files. Tag reading is
attempted with mutagen when available; pure-path fallbacks keep the scanner
usable for unsupportable or broken files.
"""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

AUDIO_EXTENSIONS = {
    ".mp3", ".flac", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".wma", ".aiff",
    ".aif", ".opus", ".mp4",
}


def _safe_track_id(path: Path) -> str:
    return "file:" + str(path.resolve())


def _read_tags(path: Path) -> dict:
    """Best-effort tag extraction; never raises."""
    try:
        import mutagen

        audio = mutagen.File(str(path), easy=True)
    except Exception:
        return {}
    if audio is None or not getattr(audio, "tags", None):
        return {}
    tags = audio.tags

    def first(key: str):
        value = tags.get(key)
        if isinstance(value, list) and value:
            return str(value[0])
        return None

    year_raw = first("date") or first("year")
    year = None
    if year_raw and year_raw[:4].isdigit():
        year = int(year_raw[:4])
    duration_ms = None
    info = getattr(audio, "info", None)
    if info and getattr(info, "length", None):
        duration_ms = int(info.length * 1000)
    return {
        "title": first("title"),
        "artist": first("artist"),
        "album": first("album"),
        "year": year,
        "duration_ms": duration_ms,
    }


def _record_from_path(path: Path) -> dict:
    tags = _read_tags(path)
    return {
        "track_id": _safe_track_id(path),
        "title": tags.get("title") or path.stem,
        "artist": tags.get("artist") or "Unknown Artist",
        "album": tags.get("album"),
        "year": tags.get("year"),
        "duration_ms": tags.get("duration_ms"),
        "spotify_url": None,
        "local_file_path": str(path),
    }


def scan_folder(db, folder_path: str, extensions: Iterable[str] | None = None) -> int:
    """Recursively index every audio file below ``folder_path``."""
    root = Path(folder_path)
    if not root.is_dir():
        raise ValueError(f"not a directory: {folder_path}")
    allowed = {e.lower() for e in (extensions or AUDIO_EXTENSIONS)}
    added = 0
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix.lower() in allowed:
            db.upsert_track(_record_from_path(path))
            added += 1
    return added


def import_files(db, file_paths: Iterable[str]) -> int:
    """Import an explicit list of media files."""
    added = 0
    for raw in file_paths:
        path = Path(raw)
        if path.is_file():
            db.upsert_track(_record_from_path(path))
            added += 1
    return added


def library_stats(db) -> dict:
    tracks = db.all_tracks()
    return {
        "total_tracks": len(tracks),
        "total_albums": len({t.get("album") for t in tracks if t.get("album")}),
        "total_artists": len({t.get("artist") for t in tracks if t.get("artist")}),
    }
