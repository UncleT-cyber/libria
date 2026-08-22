from pathlib import Path

import pytest

from libria.audio_controller import AudioController, AudioState, PlaybackBackend
from libria.db import Database
from libria.downloader import DownloadJob, PlaybackDownloadManager
from libria.settings import SettingsManager


class SilentBackend(PlaybackBackend):
    def __init__(self):
        self.played = []

    def load(self, source):
        self.source = source

    def play(self):
        self.played.append(self.source)

    def pause(self):
        pass

    def resume(self):
        pass

    def stop(self):
        pass

    def get_time_ms(self):
        return 0

    def get_length_ms(self):
        return 0


def fake_archiver(job: DownloadJob, dest_dir: str) -> str:
    Path(dest_dir).mkdir(parents=True, exist_ok=True)
    out = Path(dest_dir) / f"{job.track_id}.mp3"
    out.write_bytes(b"\x00" * 128)
    return str(out)


def make_stack(tmp_path):
    db = Database(tmp_path / "libria.db")
    settings = SettingsManager(
        db, defaults={"download_directory": str(tmp_path / "downloads")})
    backend = SilentBackend()
    states = []
    audio = AudioController(
        backend=backend, ui_update_callback=lambda s, t: states.append(s))
    archived = []
    manager = PlaybackDownloadManager(
        db=db, audio_controller=audio, settings=settings,
        archiver=fake_archiver,
        on_track_archived=lambda tid, path: archived.append((tid, path)),
    )
    return db, backend, states, archived, manager


TRACK = {
    "track_id": "spotify:track:abc123",
    "title": "Song",
    "artist": "Artist",
    "album": "Album",
    "year": 2024,
    "spotify_url": "https://open.spotify.com/track/abc123",
}


def test_play_while_downloading_workflow(tmp_path):
    db, backend, states, archived, manager = make_stack(tmp_path)
    db.upsert_track(TRACK)

    manager.request_track(TRACK, play_now=True)
    # immediate stream starts from the network URL (no local file yet)
    assert backend.played == [TRACK["spotify_url"]]
    assert states[-1] == AudioState.PLAYING

    assert manager.wait_idle(timeout=10)

    # post-download state sync: DB points at the local archive
    record = db.get_track("abc123")
    assert record["local_file_path"] is not None
    assert Path(record["local_file_path"]).is_file()
    assert archived == [("abc123", record["local_file_path"])]

    # strict file injection happened before the DB entry was finalized
    from mutagen.id3 import ID3
    tags = ID3(record["local_file_path"])
    assert tags["TIT2"].text == ["Song"]
    assert tags["TPE1"].text == ["Artist"]


def test_archived_track_replays_from_disk_and_skips_queue(tmp_path):
    db, backend, _, _, manager = make_stack(tmp_path)
    db.upsert_track(TRACK)
    local = tmp_path / "already.mp3"
    local.write_bytes(b"\x00" * 16)
    db.set_local_file_path("abc123", str(local))

    manager.request_track(TRACK, play_now=True)
    assert backend.played == [str(local)]          # zero-buffer local file
    assert manager.task_queue.empty()              # no redundant archival


def test_failed_download_does_not_kill_worker(tmp_path):
    db, backend, _, archived, manager = make_stack(tmp_path)

    def flaky_archiver(job, dest_dir):
        if job.track_id == "bad1":
            raise IOError("network exploded")
        return fake_archiver(job, dest_dir)

    manager._archiver = flaky_archiver
    db.upsert_track({**TRACK, "track_id": "bad1"})
    db.upsert_track({**TRACK, "track_id": "good1"})

    manager.request_track({**TRACK, "track_id": "bad1"}, play_now=False)
    manager.request_track({**TRACK, "track_id": "good1"}, play_now=False)
    assert manager.wait_idle(timeout=10)

    assert len(manager.errors) == 1                      # failure recorded
    assert db.get_track("bad1")["local_file_path"] is None
    assert db.get_track("good1")["local_file_path"] is not None
    assert archived == [("good1", db.get_track("good1")["local_file_path"])]
