from mutagen.id3 import APIC, ID3, TALB, TIT2, TPE1, TYER, USLT

from libria.tagging import build_frames, embed_metadata, inject_metadata

METADATA = {"title": "Título", "artist": "Årtist", "album": "Álbum", "year": 2024}
ART = b"\xff\xd8\xff\xe0fake-jpeg"
LYRICS = "line one\nline two"


def test_build_frames_textual_bindings():
    frames = build_frames(METADATA)
    by_key = {f.FrameID: f for f in frames}
    assert by_key["TIT2"].text == ["Título"] and by_key["TIT2"].encoding == 3
    assert by_key["TPE1"].text == ["Årtist"] and by_key["TPE1"].encoding == 3
    assert by_key["TALB"].text == ["Álbum"] and by_key["TALB"].encoding == 3
    assert by_key["TYER"].text == ["2024"] and by_key["TYER"].encoding == 3
    # no art/lyrics requested -> those frames are absent
    assert "APIC" not in by_key and "USLT" not in by_key


def test_build_frames_artwork_and_lyrics():
    frames = build_frames(METADATA, img_data=ART, lyrics_text=LYRICS)
    by_key = {f.FrameID: f for f in frames}
    apic = by_key["APIC"]
    assert isinstance(apic, APIC)
    assert apic.type == 3  # front cover
    assert apic.mime == "image/jpeg"
    assert apic.data == ART
    uslt = by_key["USLT"]
    assert isinstance(uslt, USLT)
    assert uslt.lang == "eng"
    assert uslt.text == LYRICS


class ExplodingAddTags:
    """FileType-like object whose add_tags() raises - the blueprint's
    explicit catch-block must still apply frames and save."""

    def __init__(self):
        self.tags = ID3()
        self.saved = False

    def add_tags(self):
        raise RuntimeError("no add_tags on this format")

    def save(self):
        self.saved = True


def test_inject_metadata_survives_add_tags_failure():
    audio = ExplodingAddTags()
    inject_metadata(audio, METADATA, ART, LYRICS)
    assert audio.saved
    assert audio.tags["TIT2"].text == ["Título"]
    assert audio.tags.getall("APIC")[0].type == 3
    assert audio.tags.getall("USLT")[0].lang == "eng"


def test_embed_metadata_roundtrip_on_unknown_container(tmp_path):
    # mutagen.File cannot sniff this; embed_metadata must fall back to the
    # raw ID3 layer and still persist every frame to disk.
    target = tmp_path / "download.mp3"
    target.write_bytes(b"\x00" * 64)
    embed_metadata(str(target), METADATA, ART, LYRICS)

    back = ID3(str(target))
    assert back["TIT2"].text == ["Título"]
    assert back["TPE1"].text == ["Årtist"]
    assert back["TALB"].text == ["Álbum"]
    # mutagen canonically upgrades TYER to its v2.4 equivalent (TDRC)
    year = back.get("TYER") or back.get("TDRC")
    assert year is not None and str(year.text[0]) == "2024"
    apic = back.getall("APIC")[0]
    assert apic.data == ART and apic.type == 3
    uslt = back.getall("USLT")[0]
    assert uslt.text == LYRICS and uslt.lang == "eng"
