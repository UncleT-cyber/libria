import sqlite3

import pytest

from libria.db import Database, normalize_track_id


@pytest.fixture
def db(tmp_path):
    database = Database(tmp_path / "libria.db")
    yield database
    database.close()


def make_track(track_id="abc123", **overrides):
    track = {
        "track_id": track_id,
        "title": "Song",
        "artist": "Artist",
        "album": "Album",
        "year": 2024,
        "duration_ms": 200000,
        "spotify_url": f"https://open.spotify.com/track/{track_id}",
    }
    track.update(overrides)
    return track


def test_foreign_keys_enforced(db):
    row = db._conn.execute("PRAGMA foreign_keys").fetchone()
    assert row[0] == 1
    with pytest.raises(sqlite3.IntegrityError):
        db.add_favorite("nonexistent-track")


def test_normalize_track_id_variants():
    assert normalize_track_id("spotify:track:4uLU6hMCjMI75M1A2tKUQC") == "4uLU6hMCjMI75M1A2tKUQC"
    assert normalize_track_id("4uLU6hMCjMI75M1A2tKUQC") == "4uLU6hMCjMI75M1A2tKUQC"
    assert normalize_track_id(
        "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc"
    ) == "4uLU6hMCjMI75M1A2tKUQC"


def test_tracks_decoupled_from_filesystem(db):
    db.upsert_track(make_track())
    record = db.get_track("abc123")
    assert record is not None
    assert record["local_file_path"] is None  # cloud stream by default
    db.set_local_file_path("abc123", "/tmp/archive/song.mp3")
    assert db.get_track("abc123")["local_file_path"] == "/tmp/archive/song.mp3"


def test_upsert_preserves_local_path(db):
    db.upsert_track(make_track())
    db.set_local_file_path("abc123", "/tmp/archive/song.mp3")
    db.upsert_track(make_track(title="Song (Remastered)"))
    record = db.get_track("abc123")
    assert record["title"] == "Song (Remastered)"
    assert record["local_file_path"] == "/tmp/archive/song.mp3"


def test_favorites_1to1(db):
    db.upsert_track(make_track())
    db.add_favorite("abc123")
    db.add_favorite("abc123")  # idempotent
    assert db.is_favorite("abc123")
    assert [t["track_id"] for t in db.favorite_tracks()] == ["abc123"]
    db.remove_favorite("abc123")
    assert not db.is_favorite("abc123")
    assert db.favorite_tracks() == []


def test_collections_junction_multi_type(db):
    db.upsert_track(make_track("t1"))
    db.upsert_track(make_track("t2", title="Other"))
    for ctype in ("album", "playlist", "genre_mix"):
        cid = db.create_collection(f"my {ctype}", ctype)
        db.add_to_collection(cid, "t1", position=1)
        db.add_to_collection(cid, "t2", position=2)
        assert [t["track_id"] for t in db.collection_tracks(cid)] == ["t1", "t2"]
    with pytest.raises(sqlite3.IntegrityError):
        db.create_collection("bad", "bogus_type")


def test_app_settings_atomic_upsert(db):
    db.set_setting("audio_quality", "standard")
    db.set_setting("audio_quality", "high")
    assert db.get_setting("audio_quality") == "high"
    assert db.get_setting("missing") is None
    assert db.all_settings() == {"audio_quality": "high"}
