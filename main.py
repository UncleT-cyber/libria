"""Libria desktop entry point.

Wires the SQLite ledger, settings manager, audio controller and the
play-while-downloading engine into the customtkinter shell.
"""
from __future__ import annotations

from pathlib import Path

from libria.audio_controller import AudioController, create_backend
from libria.db import Database
from libria.downloader import PlaybackDownloadManager
from libria.settings import SettingsManager


def build_app(db_path: str | None = None):
    db_path = db_path or str(Path.home() / ".libria" / "libria.db")
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    db = Database(db_path)
    settings = SettingsManager(db)
    audio = AudioController(backend=create_backend())
    manager = PlaybackDownloadManager(db=db, audio_controller=audio, settings=settings)

    from libria.ui.app import LibriaApp  # GUI-time import (requires display)

    return LibriaApp(db=db, settings=settings,
                     audio_controller=audio, download_manager=manager)


if __name__ == "__main__":
    build_app().mainloop()
