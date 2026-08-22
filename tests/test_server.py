import json
import urllib.request

import pytest

from libria.server import create_server


@pytest.fixture
def server(tmp_path):
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
