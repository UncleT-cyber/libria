"""Concurrent play-while-downloading engine (spec section 4 / directive B).

A persistent daemon consumer thread drains a thread-safe FIFO queue
(``queue.Queue``). When a track is activated in the UI, ``request_track``
fires the multi-pronged instruction block:

  1. consult the database for an existing local archive,
  2. route the media source to the audio controller immediately
     (zero-buffer file if archived, streaming URL otherwise),
  3. hand a tracking job (target URL + hash ID) to the background queue.

Each job is processed inside a catch-all frame so one failed download can
never kill the runner. After archival, the file is tagged via
:mod:`libria.tagging`, the DB row is pointed at the new local path, and the
GUI is signaled to flip the item's icon from cloud to downloaded.
"""
from __future__ import annotations

import logging
import queue
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

from . import tagging
from .db import normalize_track_id

logger = logging.getLogger(__name__)

DEFAULT_DOWNLOAD_DIR = Path.home() / "Music" / "libria"


@dataclass(frozen=True)
class DownloadJob:
    track_id: str
    url: str
    metadata: dict
    img_data: Optional[bytes] = field(default=None, repr=False)
    lyrics_text: Optional[str] = field(default=None, repr=False)


def yt_dlp_archiver(job: DownloadJob, dest_dir: str) -> str:
    """Default archiver: fetch best-quality audio with yt-dlp. Injected as a
    dependency so tests (or alternate downloaders) can replace it."""
    import yt_dlp  # lazy: heavyweight optional dependency

    Path(dest_dir).mkdir(parents=True, exist_ok=True)
    outtmpl = str(Path(dest_dir) / "%(title)s-%(id)s.%(ext)s")
    options = {
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "quiet": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "320",
        }],
    }
    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(job.url, download=True)
        base = Path(ydl.prepare_filename(info))
        candidate = base.with_suffix(".mp3")
        return str(candidate if candidate.exists() else base)


class PlaybackDownloadManager:
    def __init__(self, *, db, audio_controller,
                 settings=None,
                 archiver: Optional[Callable[[DownloadJob, str], str]] = None,
                 on_track_archived: Optional[Callable[[str, str], None]] = None,
                 on_error: Optional[Callable[[DownloadJob, Exception], None]] = None):
        self._db = db
        self._audio = audio_controller
        self._settings = settings
        self._archiver = archiver or yt_dlp_archiver
        self._on_track_archived = on_track_archived
        self._on_error = on_error
        self.task_queue: "queue.Queue[DownloadJob]" = queue.Queue()
        self.errors: list[Exception] = []
        self._thread = threading.Thread(
            target=self._worker, name="libria-archiver", daemon=True
        )
        self._thread.start()

    # -- the request workflow (UI-facing) -------------------------------
    def request_track(self, track: dict, play_now: bool = True) -> None:
        track_id = normalize_track_id(track.get("track_id") or "")
        record = self._db.get_track(track_id) or {}
        merged = {**track, **{k: v for k, v in record.items() if v is not None},
                  "track_id": track_id}

        # 2. route media source to the audio controller immediately
        if play_now:
            self._audio.play_track(merged)

        # 1./3. skip re-archival when the local file already exists
        if not self._is_archived(merged):
            self.task_queue.put(DownloadJob(
                track_id=track_id,
                url=merged.get("spotify_url") or merged.get("url") or "",
                metadata={
                    "title": merged.get("title", ""),
                    "artist": merged.get("artist", ""),
                    "album": merged.get("album") or "",
                    "year": merged.get("year") or "",
                },
                lyrics_text=merged.get("lyrics"),
            ))

    # -- the persistent worker loop --------------------------------------
    def _worker(self) -> None:
        while True:
            job = self.task_queue.get()
            try:
                dest_dir = self._download_dir()
                path = self._archiver(job, dest_dir)
                # strict file injection before finalizing the DB entry
                tagging.embed_metadata(path, job.metadata,
                                       job.img_data, job.lyrics_text)
                # post-download state sync
                self._db.set_local_file_path(job.track_id, path)
                if self._on_track_archived is not None:
                    self._on_track_archived(job.track_id, path)
            except Exception as exc:  # catch-all: one failure must not kill the loop
                self.errors.append(exc)
                logger.warning("Archiver background error for %s: %s",
                               job.track_id, exc)
                if self._on_error is not None:
                    try:
                        self._on_error(job, exc)
                    except Exception:
                        pass
            finally:
                self.task_queue.task_done()

    # -- helpers -----------------------------------------------------------
    def wait_idle(self, timeout: Optional[float] = None) -> bool:
        """Block until the queue drains (test / shutdown support)."""
        done = threading.Event()
        watcher = threading.Thread(
            target=lambda: (self.task_queue.join(), done.set()), daemon=True
        )
        watcher.start()
        return done.wait(timeout)

    def _download_dir(self) -> str:
        if self._settings is not None:
            value = self._settings.get("download_directory")
            if value:
                return value
        return str(DEFAULT_DOWNLOAD_DIR)

    def _is_archived(self, track: dict) -> bool:
        path = track.get("local_file_path")
        return bool(path) and Path(path).is_file()
