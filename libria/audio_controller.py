"""Audio execution controller (spec section 2).

Wraps the media layer (python-vlc preferred, pygame fallback, headless
null backend last) behind a clean interface for the GUI thread.

  - Unified source handler: accepts local paths *and* network URLs; a valid
    local file always wins over network resolution to bypass latency.
  - State telemetry: every playback mutation (playing / paused / stopped /
    buffering) is broadcast through ``ui_update_callback``.
  - Granular metrics: ``get_progress()`` returns elapsed ms, total ms and an
    absolute percentage float in [0.0, 1.0].
"""
from __future__ import annotations

import os
import time
from enum import Enum
from typing import Callable, Optional


class AudioState(str, Enum):
    PLAYING = "playing"
    PAUSED = "paused"
    STOPPED = "stopped"
    BUFFERING = "buffering"


# callback signature: (state: AudioState, track: Optional[dict]) -> None
UIUpdateCallback = Callable[[AudioState, Optional[dict]], None]


class PlaybackBackend:
    """Backend protocol implemented by VLC / pygame / null adapters."""

    name = "abstract"

    def load(self, source: str) -> None:
        raise NotImplementedError

    def play(self) -> None:
        raise NotImplementedError

    def pause(self) -> None:
        raise NotImplementedError

    def resume(self) -> None:
        raise NotImplementedError

    def stop(self) -> None:
        raise NotImplementedError

    def get_time_ms(self) -> int:
        raise NotImplementedError

    def get_length_ms(self) -> int:
        raise NotImplementedError


class VLCBackend(PlaybackBackend):
    name = "vlc"

    def __init__(self):
        import vlc  # lazy: libvlc may be absent on headless systems

        self._vlc = vlc
        self._instance = vlc.Instance()
        self._player = self._instance.media_player_new()

    def load(self, source: str) -> None:
        self._player.set_media(self._instance.media_new(source))

    def play(self) -> None:
        self._player.play()

    def pause(self) -> None:
        self._player.pause()

    def resume(self) -> None:
        self._player.play()

    def stop(self) -> None:
        self._player.stop()

    def get_time_ms(self) -> int:
        value = self._player.get_time()
        return max(0, int(value)) if value is not None else 0

    def get_length_ms(self) -> int:
        value = self._player.get_length()
        return max(0, int(value)) if value is not None else 0


class PygameBackend(PlaybackBackend):
    name = "pygame"

    def __init__(self):
        import pygame  # lazy import

        pygame.mixer.init()
        self._music = pygame.mixer.music

    def load(self, source: str) -> None:
        self._music.load(source)

    def play(self) -> None:
        self._music.play()

    def pause(self) -> None:
        self._music.pause()

    def resume(self) -> None:
        self._music.unpause()

    def stop(self) -> None:
        self._music.stop()

    def get_time_ms(self) -> int:
        # pygame reports ms since playback start
        return max(0, self._music.get_pos())

    def get_length_ms(self) -> int:
        # pygame cannot report length; controller falls back to track metadata
        return 0


class NullBackend(PlaybackBackend):
    """Headless fallback: keeps state and a monotonic clock so the engine
    and its telemetry remain fully testable without audio hardware."""

    name = "null"

    def __init__(self):
        self.source: Optional[str] = None
        self._started_at: Optional[float] = None

    def load(self, source: str) -> None:
        self.source = source

    def play(self) -> None:
        if self._started_at is None:
            self._started_at = time.monotonic()

    def pause(self) -> None:
        self._started_at = None

    def resume(self) -> None:
        self.play()

    def stop(self) -> None:
        self._started_at = None

    def get_time_ms(self) -> int:
        if self._started_at is None:
            return 0
        return int((time.monotonic() - self._started_at) * 1000)

    def get_length_ms(self) -> int:
        return 0


def create_backend(preferred: Optional[str] = None) -> PlaybackBackend:
    order = {
        "vlc": (VLCBackend, PygameBackend),
        "pygame": (PygameBackend, VLCBackend),
    }.get(preferred or "", (VLCBackend, PygameBackend))
    for backend_cls in order:
        try:
            return backend_cls()
        except Exception:
            continue
    return NullBackend()


class AudioController:
    def __init__(self, backend: Optional[PlaybackBackend] = None,
                 ui_update_callback: Optional[UIUpdateCallback] = None):
        self.backend = backend if backend is not None else create_backend()
        self.ui_update_callback = ui_update_callback
        self._state = AudioState.STOPPED
        self._current_track: Optional[dict] = None

    @property
    def state(self) -> AudioState:
        return self._state

    @property
    def current_track(self) -> Optional[dict]:
        return self._current_track

    # -- unified source handler ----------------------------------------
    @staticmethod
    def resolve_source(track: dict) -> str:
        """Prefer a valid local file (zero-buffer); otherwise stream URL."""
        local = track.get("local_file_path")
        if local and os.path.isfile(local):
            return local
        url = track.get("spotify_url") or track.get("url")
        if url:
            return url
        raise ValueError(
            f"track {track.get('track_id')!r} has no playable source "
            "(no local file, no network URL)"
        )

    # -- playback lifecycle ---------------------------------------------
    def play_track(self, track: dict) -> None:
        source = self.resolve_source(track)
        self._emit(AudioState.BUFFERING, track)
        self.backend.load(source)
        self.backend.play()
        self._current_track = track
        self._emit(AudioState.PLAYING, track)

    def pause(self) -> None:
        self.backend.pause()
        self._emit(AudioState.PAUSED)

    def resume(self) -> None:
        self.backend.resume()
        self._emit(AudioState.PLAYING)

    def stop(self) -> None:
        self.backend.stop()
        self._emit(AudioState.STOPPED)

    # -- granular metrics extractor --------------------------------------
    def get_progress(self) -> dict:
        elapsed = max(0, int(self.backend.get_time_ms()))
        total = max(0, int(self.backend.get_length_ms()))
        if not total and self._current_track:
            total = max(0, int(self._current_track.get("duration_ms") or 0))
        percent = min(1.0, max(0.0, elapsed / total)) if total else 0.0
        return {"elapsed_ms": elapsed, "total_ms": total, "percent": percent}

    # -- telemetry --------------------------------------------------------
    def set_ui_update_callback(self, callback: Optional[UIUpdateCallback]) -> None:
        self.ui_update_callback = callback

    def _emit(self, state: AudioState, track: Optional[dict] = None) -> None:
        self._state = state
        if track is not None:
            self._current_track = track
        if self.ui_update_callback is not None:
            self.ui_update_callback(state, self._current_track)
