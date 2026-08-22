import json
import urllib.request

import pytest

from libria import spotify
from libria.server import create_server


@pytest.fixture
def server(tmp_path, monkeypatch):
    # Metadata lookup is opportunistic; never let tests depend on the network.
    monkeypatch.setattr(spotify, "fetch_oembed", lambda url, timeout=5.0: {})
    srv = create_server(db_path=str(tmp_path / "api.db"), port=0)
    port = srv.server_address[1]
    import threading

    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{port}"
    music = tmp_path / "music"
    music.mkdir()
    (music / "song.mp3").write_bytes(b"\x00" * 32)
    (music / "other.flac").write_bytes(b"\x00" * 32)
    yield base, music
    srv.shutdown()
    thread.join(timeout=5)


def get(base, endpoint):
    with urllib.request.urlopen(f"{base}/api/{endpoint}", timeout=5) as resp:
        return resp.status, json.load(resp)


def post(base, endpoint, body):
    req = urllib.request.Request(
        f"{base}/api/{endpoint}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.status, json.load(resp)


def test_health(server):
    base, _ = server
    status, body = get(base, "health")
    assert status == 200 and body["status"] == "ok"


def test_scan_folder_then_get_library_and_stats(server):
    base, music = server
    status, result = post(base, "scan_folder", {"folderPath": str(music)})
    assert status == 200
    assert result["added"] == 2

    _, tracks = get(base, "get_library")
    assert len(tracks) == 2
    assert all(t["local_file_path"] for t in tracks)

    _, stats = get(base, "get_library_stats")
    assert stats["total_tracks"] == 2


def test_import_files(server):
    base, music = server
    status, result = post(
        base, "import_files",
        {"filePaths": [str(music / "song.mp3"), str(music / "ghost.mp3")]},
    )
    assert status == 200
    assert result["added"] == 1
    _, tracks = get(base, "get_library")
    assert len(tracks) == 1


def test_unknown_endpoint_404(server):
    base, _ = server
    with pytest.raises(urllib.error.HTTPError) as info:
        urllib.request.urlopen(f"{base}/api/nope", timeout=5)
    assert info.value.code == 404


def test_scan_folder_missing_path_500(server):
    base, _ = server
    with pytest.raises(urllib.error.HTTPError) as info:
        post(base, "scan_folder", {"folderPath": "/definitely/not/here"})
    assert info.value.code == 500
    assert b"not a directory" in info.value.read()


def test_import_spotify_creates_stream_only_row(server):
    base, _ = server
    status, result = post(
        base, "import_spotify",
        {"url": "https://open.spotify.com/track/0eGcygCz4qIPkGdEzHyiup?si=x"},
    )
    assert status == 200
    track = result["track"]
    assert track["track_id"] == "0eGcygCz4qIPkGdEzHyiup"
    assert track["spotify_url"].startswith("https://open.spotify.com/track/")
    assert track["local_file_path"] is None  # stream-only until the queue archives it
    assert result["enqueued"] is False      # no download manager in this fixture


def test_import_spotify_rejects_bad_url(server):
    base, _ = server
    with pytest.raises(urllib.error.HTTPError) as info:
        post(base, "import_spotify", {"url": "https://example.com/x"})
    assert info.value.code == 500
    assert b"not a Spotify URL" in info.value.read()


def test_audio_endpoint_streams_archived_file(server, tmp_path):
    base, _ = server
    media = tmp_path / "tune.wav"
    media.write_bytes(b"RIFF" + b"\x00" * 100)
    post(base, "import_files", {"filePaths": [str(media)]})
    _, tracks = get(base, "get_library")
    track_id = tracks[0]["track_id"]

    url = f"{base}/api/audio/{urllib.parse.quote(track_id, safe='')}"
    with urllib.request.urlopen(url, timeout=5) as resp:
        assert resp.status == 200
        assert resp.headers.get("Accept-Ranges") == "bytes"
        assert resp.read(8) == b"RIFF\x00\x00\x00\x00"

    req = urllib.request.Request(url, headers={"Range": "bytes=4-9"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        assert resp.status == 206
        assert resp.headers["Content-Range"].startswith("bytes 4-9/")
        assert len(resp.read()) == 6


def test_audio_endpoint_404_for_stream_only(server):
    base, _ = server
    post(base, "import_spotify", {"url": "https://open.spotify.com/track/abc123"})
    with pytest.raises(urllib.error.HTTPError) as info:
        urllib.request.urlopen(f"{base}/api/audio/abc123", timeout=5)
    assert info.value.code == 404


def test_settings_roundtrip(server):
    base, _ = server
    _, initial = get(base, "get_settings")
    assert initial["audio_quality"] == "320kbps"

    post(base, "set_setting", {"key": "audio_quality", "value": "128kbps"})
    _, updated = get(base, "get_settings")
    assert updated["audio_quality"] == "128kbps"
