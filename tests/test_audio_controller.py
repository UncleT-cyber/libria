import pytest

from libria.audio_controller import (
    AudioController,
    AudioState,
    PlaybackBackend,
)


class ScriptedBackend(PlaybackBackend):
    """In-memory media backend standing in for VLC/pygame (no audio
    hardware in CI). Records calls and returns scripted clock/length."""

    def __init__(self, length_ms=0):
        self.calls = []
        self.source = None
        self.time_ms = 0
        self._length_ms = length_ms

    def load(self, source):
        self.source = source
        self.calls.append(("load", source))

    def play(self):
        self.calls.append(("play",))

    def pause(self):
        self.calls.append(("pause",))

    def resume(self):
        self.calls.append(("resume",))

    def stop(self):
        self.calls.append(("stop",))

    def get_time_ms(self):
        return self.time_ms

    def get_length_ms(self):
        return self._length_ms


def make_controller(length_ms=0):
    states = []
    backend = ScriptedBackend(length_ms=length_ms)
    controller = AudioController(
        backend=backend,
        ui_update_callback=lambda state, track: states.append(state),
    )
    return controller, backend, states


def test_resolve_source_prefers_local_file(tmp_path):
    local = tmp_path / "song.mp3"
    local.write_bytes(b"\x00" * 32)
    track = {"local_file_path": str(local), "spotify_url": "https://x/stream"}
    assert AudioController.resolve_source(track) == str(local)


def test_resolve_source_falls_back_to_network_url(tmp_path):
    missing = tmp_path / "gone.mp3"
    track = {"local_file_path": str(missing), "spotify_url": "https://x/stream"}
    assert AudioController.resolve_source(track) == "https://x/stream"


def test_resolve_source_requires_some_source():
    with pytest.raises(ValueError):
        AudioController.resolve_source({"track_id": "nope"})


def test_play_broadcasts_buffering_then_playing(tmp_path):
    controller, backend, states = make_controller()
    controller.play_track({"track_id": "t1", "spotify_url": "https://x/s"})
    assert states == [AudioState.BUFFERING, AudioState.PLAYING]
    assert backend.calls == [("load", "https://x/s"), ("play",)]


def test_pause_resume_stop_transitions():
    controller, backend, states = make_controller()
    controller.play_track({"track_id": "t1", "spotify_url": "u"})
    controller.pause()
    controller.resume()
    controller.stop()
    assert states == [
        AudioState.BUFFERING, AudioState.PLAYING,
        AudioState.PAUSED, AudioState.PLAYING, AudioState.STOPPED,
    ]


def test_progress_metrics_granular():
    controller, backend, _ = make_controller(length_ms=120_000)
    controller.play_track({"track_id": "t1", "spotify_url": "u"})
    backend.time_ms = 30_000
    progress = controller.get_progress()
    assert progress["elapsed_ms"] == 30_000
    assert progress["total_ms"] == 120_000
    assert progress["percent"] == pytest.approx(0.25)


def test_progress_clamped_and_metadata_fallback():
    controller, backend, _ = make_controller(length_ms=0)
    controller.play_track(
        {"track_id": "t1", "spotify_url": "u", "duration_ms": 60_000})
    backend.time_ms = 90_000  # beyond total -> clamp to 1.0
    progress = controller.get_progress()
    assert progress["total_ms"] == 60_000  # fell back to track metadata
    assert progress["percent"] == 1.0
