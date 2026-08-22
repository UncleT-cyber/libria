"""ID3 tagging blueprint (spec section 4 / master directive section A).

Every downloaded component undergoes strict file injection before its
database entry is finalized:

  * text frames TIT2 (title), TPE1 (lead artist), TALB (album), TYER (year)
    with ``encoding=3`` (UTF-8),
  * album art injected as an APIC binary blob with ``type=3`` (front cover),
  * lyrics embedded via USLT with ``lang='eng'`` locale parameters.
"""
from __future__ import annotations

from typing import Optional

import mutagen
from mutagen.id3 import APIC, TALB, TIT2, TPE1, TYER, USLT, ID3, ID3NoHeaderError


class TaggingError(Exception):
    pass


def build_frames(metadata: dict, img_data: Optional[bytes] = None,
                 lyrics_text: Optional[str] = None) -> list:
    """Pure frame construction - the blueprint, isolated for verification."""
    frames = [
        TIT2(encoding=3, text=str(metadata["title"])),
        TPE1(encoding=3, text=str(metadata["artist"])),
        TALB(encoding=3, text=str(metadata["album"])),
        TYER(encoding=3, text=str(metadata["year"])),
    ]
    if img_data:
        frames.append(APIC(
            encoding=3,
            mime="image/jpeg",
            type=3,  # front cover
            desc="Cover",
            data=img_data,
        ))
    if lyrics_text:
        frames.append(USLT(
            encoding=3,
            lang="eng",
            desc="Lyrics",
            text=lyrics_text,
        ))
    return frames


def inject_metadata(audio, metadata: dict, img_data: Optional[bytes] = None,
                    lyrics_text: Optional[str] = None) -> None:
    """Apply the blueprint to an open mutagen FileType object."""
    # Initialize the ID3 header if the file has none yet.
    try:
        audio.add_tags()
    except Exception:
        pass  # tags already exist
    for frame in build_frames(metadata, img_data, lyrics_text):
        audio.tags.add(frame)
    audio.save()


def embed_metadata(file_path: str, metadata: dict, img_data: Optional[bytes] = None,
                   lyrics_text: Optional[str] = None) -> None:
    """Tag an on-disk audio file. Falls back to raw ID3 surgery when the
    container is not recognized by mutagen (e.g. partial downloads)."""
    if not file_path:
        raise TaggingError("no file path supplied for tagging")
    try:
        audio = mutagen.File(file_path, easy=False)
    except Exception:
        audio = None
    if audio is not None:
        inject_metadata(audio, metadata, img_data, lyrics_text)
        return
    try:
        tags = ID3(file_path)
    except ID3NoHeaderError:
        tags = ID3()
    except Exception as exc:
        raise TaggingError(f"cannot open ID3 layer for {file_path!r}: {exc}") from exc
    for frame in build_frames(metadata, img_data, lyrics_text):
        tags.add(frame)
    tags.save(file_path)
