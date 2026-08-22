# AGENTS.md

## Repository layout

This repo has two stacks:

1. `src/` + `src-tauri/` — the original Vite/React + Tauri (Rust) scaffold.
2. `libria/` + `main.py` + `tests/` — the Python implementation of the
   "Multi-Threaded Audio Player & Media Archiver" master directive
   (customtkinter GUI, SQLite ledger, queue.Queue download engine,
   mutagen tagging). This is the active implementation.

## Python package map

- `libria/db.py` — SQLite layer. `PRAGMA foreign_keys = ON` on every
  connection; `tracks` keyed by normalized Spotify ID with nullable
  `local_file_path`; `favorites` is a 1:1 linked table; `collections` +
  `collection_tracks` junction (album/playlist/genre_mix); `app_settings`
  key-value ledger. Shared across threads (`check_same_thread=False` +
  write lock).
- `libria/settings.py` — SettingsManager: ledger-first writes, then
  broadcast to listeners.
- `libria/audio_controller.py` — VLC → pygame → Null backend chain;
  `resolve_source` prefers existing local files over URLs;
  `get_progress()` -> {elapsed_ms, total_ms, percent 0.0–1.0}.
- `libria/tagging.py` — mutagen ID3 blueprint: TIT2/TPE1/TALB/TYER with
  encoding=3, APIC type=3 front cover, USLT lang='eng'. Note: mutagen
  canonically upgrades TYER to TDRC (v2.4) when added to an ID3 object.
- `libria/downloader.py` — PlaybackDownloadManager: persistent daemon
  thread draining queue.Queue; play-while-downloading; catch-all per job;
  yt-dlp archiver injectable via constructor for tests.
- `libria/ui/router.py` — display-agnostic view swap (headless-testable);
  `libria/ui/pages.py`, `libria/ui/app.py` import customtkinter and only
  work with a display. Never import them in tests or headless contexts.

## Conventions

- No display in CI: keep tkinter/customtkinter imports inside
  `libria/ui/pages.py`, `libria/ui/app.py`, and `main.py` only.
- All heavy work (network, disk, tagging) runs on the downloader worker
  thread; UI callbacks marshal via `root.after(0, ...)`.
- Run tests: `python3 -m pytest tests/ -q` from repo root.
