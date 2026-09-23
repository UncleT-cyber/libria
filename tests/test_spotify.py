import pytest

from libria.spotify import parse_spotify_ref, track_payload


TRACK_URL = "https://open.spotify.com/track/0eGcygCz4qIPkGdEzHyiup?si=deadbeef1234"


def test_parse_track_url():
    ref = parse_spotify_ref(TRACK_URL)
    assert ref["kind"] == "track"
    assert ref["id"] == "0eGcygCz4qIPkGdEzHyiup"


def test_parse_spotify_uri():
    ref = parse_spotify_ref("spotify:track:4uLU6h3jMKiKylJgM1a9Ro")
    assert ref == {
        "kind": "track",
        "id": "4uLU6h3jMKiKylJgM1a9Ro",
        "url": "https://open.spotify.com/track/4uLU6h3jMKiKylJgM1a9Ro",
    }


def test_parse_album_and_playlist():
    assert parse_spotify_ref("https://open.spotify.com/album/abc123")["kind"] == "album"
    assert parse_spotify_ref("https://open.spotify.com/playlist/xyz")["kind"] == "playlist"


def test_parse_rejects_foreign_url():
    with pytest.raises(ValueError):
        parse_spotify_ref("https://example.com/track/1234")


def test_parse_rejects_invalid_uri():
    with pytest.raises(ValueError):
        parse_spotify_ref("spotify:user:xyz")


def test_track_payload_falls_back_to_url_title():
    payload = track_payload(parse_spotify_ref(TRACK_URL))
    assert payload["track_id"] == "0eGcygCz4qIPkGdEzHyiup"
    assert payload["title"].startswith("https://")
    assert payload["spotify_url"] == "https://open.spotify.com/track/0eGcygCz4qIPkGdEzHyiup?si=deadbeef1234"


def test_track_payload_uses_oembed_when_available():
    payload = track_payload(
        parse_spotify_ref(TRACK_URL),
        {"title": "Song Name", "artist": "The Artist", "artwork_url": "http://img"},
    )
    assert payload["title"] == "Song Name"
    assert payload["artist"] == "The Artist"
    assert payload["artwork_url"] == "http://img"


def test_album_collision_row_has_collection_title():
    payload = track_payload(parse_spotify_ref("https://open.spotify.com/album/abc123"))
    assert payload["title"].startswith("Spotify album")
    assert payload["album"] == payload["title"]


def test_parse_show_and_podcast():
    assert parse_spotify_ref("https://open.spotify.com/show/xyz")["kind"] == "show"
    assert parse_spotify_ref("https://open.spotify.com/podcast/pqr")["kind"] == "podcast"


def test_parse_spotify_uri_show():
    ref = parse_spotify_ref("spotify:show:123")
    assert ref["kind"] == "show"
    assert ref["id"] == "123"


def test_track_payload_with_show():
    payload = track_payload(parse_spotify_ref("https://open.spotify.com/show/abc"), {"title": "My Podcast"})
    assert payload["track_id"] == "show:abc"
    assert payload["title"] == "My Podcast"
    assert payload["artist"] == "Spotify"
