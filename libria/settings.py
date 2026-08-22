"""Settings persistence layer (spec sections 1 & 3).

The settings panel never mutates transient variables: every UI interaction
writes to the ``app_settings`` ledger first, then broadcasts the change to
registered operational modules (audio engine, downloader, theme switcher).
"""
from __future__ import annotations

from pathlib import Path
from typing import Callable, Dict, Optional

DEFAULTS: Dict[str, str] = {
    "download_directory": str(Path.home() / "Music" / "libria"),
    "audio_quality": "high",
    "dark_mode": "false",
}

# callback signature: (key, value) -> None
Listener = Callable[[str, str], None]


class SettingsManager:
    def __init__(self, db, defaults: Optional[Dict[str, str]] = None):
        self._db = db
        self._defaults = dict(DEFAULTS if defaults is None else defaults)
        self._listeners: list[Listener] = []
        # Materialize defaults atomically so the ledger is the single source
        # of truth even on first boot.
        for key, value in self._defaults.items():
            if self._db.get_setting(key) is None:
                self._db.set_setting(key, value)

    # -- read --------------------------------------------------------
    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        return self._db.get_setting(key, self._defaults.get(key, default))

    def get_bool(self, key: str, default: bool = False) -> bool:
        raw = self._db.get_setting(key)
        if raw is None:
            return default
        return raw.strip().lower() in ("1", "true", "yes", "on")

    def get_download_directory(self) -> str:
        return self.get("download_directory")

    # -- write: ledger first, then broadcast --------------------------
    def set(self, key: str, value) -> None:
        self._db.set_setting(key, value)
        self._broadcast(key, str(value))

    # -- broadcast wiring ---------------------------------------------
    def register_listener(self, listener: Listener) -> None:
        if listener not in self._listeners:
            self._listeners.append(listener)

    def unregister_listener(self, listener: Listener) -> None:
        if listener in self._listeners:
            self._listeners.remove(listener)

    def _broadcast(self, key: str, value: str) -> None:
        for listener in list(self._listeners):
            try:
                listener(key, value)
            except Exception:
                # A broken consumer module must not break the settings ledger.
                pass
