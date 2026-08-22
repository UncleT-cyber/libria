import pytest

from libria.db import Database
from libria.sync import import_files, library_stats, scan_folder


@pytest.fixture
def db(tmp_path):
    database = Database(tmp_path / "libria.db")
    yield database
    database.close()


def seed_tree(tmp_path):
    music = tmp_path / "music"
    (music / "artist/album").mkdir(parents=True)
    (music / "artist/album/track one.mp3").write_bytes(b"\x00" * 64)
    (music / "artist/album/track two.flac").write_bytes(b"\x00" * 64)
    (music / "artist/notes.txt").write_text("not audio")
    (music / "single.ogg").write_bytes(b"\x00" * 64)
    return music


def test_scan_folder_indexes_audio_recursively(db, tmp_path):
    music = seed_tree(tmp_path)
    added = scan_folder(db, str(music))
    assert added == 3

    tracks = db.all_tracks()
    assert len(tracks) == 3
    for track in tracks:
        assert track["local_file_path"]  # archived on disk
        assert track["title"]
    titles = {t["title"] for t in tracks}
    # mutagen can't read the dummy files -> stem fallback
    assert {"track one", "track two", "single"} == titles


def test_scan_folder_rejects_non_directory(db, tmp_path):
    with pytest.raises(ValueError):
        scan_folder(db, str(tmp_path / "missing-dir"))


def test_scan_folder_is_idempotent(db, tmp_path):
    music = seed_tree(tmp_path)
    assert scan_folder(db, str(music)) == 3
    assert scan_folder(db, str(music)) == 3  # re-scan upserts, no dupes
    assert len(db.all_tracks()) == 3


def test_import_files_specific_paths(db, tmp_path):
    music = seed_tree(tmp_path)
    added = import_files(db, [str(music / "single.ogg"),
                              str(music / "artist/notes.txt"),  # not audio? still imported if file
                              str(music / "ghost.mp3")])        # missing -> skipped
    assert added == 2
    assert len(db.all_tracks()) == 2


def test_library_stats(db, tmp_path):
    music = seed_tree(tmp_path)
    scan_folder(db, str(music))
    stats = library_stats(db)
    assert stats["total_tracks"] == 3
    assert stats["total_artists"] == 1   # all fall back to "Unknown Artist"
    assert stats["total_albums"] == 0
