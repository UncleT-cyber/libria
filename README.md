# Libria

**Your Music. Your Library. Your Way.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.x-24c8db?logo=tauri)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19-58c4dc?logo=react)](https://react.dev)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776ab?logo=python)](https://www.python.org)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-black)](https://www.apple.com/macos)

A Spotify-inspired desktop music player with a local-first library and native macOS design.

Libria lets you collect music from multiple sources, keep a searchable local library, and play with a familiar Spotify-like experience — including traffic-light-aligned navigation, a centered player, and controls pinned to the far-right edge.

---

## Features

- **Unified Library** — Browse tracks, albums, artists and playlists. Virtualized lists stay fast at any size.
- **Import Anything** — Scan a local folder, import audio files, or paste a Spotify link (`track`, `album`, `playlist`, `show`). Albums and playlists create collections automatically.
- **Play While Downloading** — Playback starts immediately. If the file is not yet archived, Libria streams and downloads in the background.
- **High-Quality Archiving** — Best-audio via `yt-dlp` with `ffmpeg` extraction to 320 kbps MP3 and proper ID3 tags.
- **Correct Tagging** — Title, artist, album, year, cover art and lyrics written with `mutagen`.
- **Lyrics** — LRCLIB lookup displayed in the Lyrics panel and embedded as USLT when available.
- **Native macOS Shell** — Overlay title bar with traffic lights at `12,26`, custom rounded-square icon (black + neon green ♫), dark theme.
- **Player** — Shuffle, previous/next, play/pause, repeat, seek bar, volume, queue, device, mini-player and fullscreen.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, TanStack Virtual, Lucide Icons |
| Desktop Shell | Tauri 2 (Rust) |
| Python App | customtkinter, SQLite, `queue.Queue` download engine, `yt-dlp`, `mutagen`, `python-vlc` / `pygame` |
| Backend | Python `libria/server.py` HTTP API (`/api`) on port `12001` |

---

## Project Structure

```
src/                 # React frontend (TopBar, PlayerBar, Sidebar, panels)
src-tauri/           # Tauri shell, window config, icons, Rust commands
libria/              # Python core: db, downloader, audio, tagging, spotify, lyrics, sync, server
main.py              # Python desktop entry (customtkinter)
tests/               # pytest suite (headless)
dist/                # Vite production build (used by Tauri)
```

Two implementations share the same product spec:

- `src` + `src-tauri` → shipped `Libria.app`
- `libria` + `main.py` + `tests` → Python reference implementation

Both talk to the same HTTP bridge: `libria/server.py`.

---

## Getting Started

### Prerequisites

- Node 20+, Rust 1.77+, Python 3.10+
- macOS recommended (for traffic-light Overlay). Linux/Windows also build via Tauri.
- Optional: `ffmpeg` for high-quality MP3 extraction, `vlc` for local playback.

### 1. Start the Python API

```bash
pip install -r requirements.txt
python -m libria.server 12001
# → http://localhost:12001
# Uses SQLite at ~/.libria/libria.db by default.
# With Supabase: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 2. Start the Frontend

```bash
npm install
npm run dev
# → http://localhost:5174  (proxies /api to :12001)
```

### 3. Run the Desktop App

```bash
# Development
npx tauri dev

# Production bundle
npm run build
cargo build --release --manifest-path src-tauri/Cargo.toml
open src-tauri/target/release/bundle/macos/Libria.app
xattr -cr src-tauri/target/release/bundle/macos/Libria.app  # clear quarantine after copy
```

### 4. Python Desktop (alternative)

```bash
python main.py   # requires a display
```

---

## Usage

1. **Add music** — Open *Your Library* and click `+` → `Add music`. Choose *Scan folder*, *Import files*, or paste a Spotify URL.
2. **Albums and playlists** — Pasting an album or playlist link creates a collection. Each track is queued for download.
3. **Play** — Click any track. The first play triggers a background download to `~/Music/libria/<Album>/` if needed. Later plays are instant from the local file.
4. **Navigate** — Use `←` / `→` next to the traffic lights to go back and forward through views.
5. **Player** — Center controls stay centered. Lyrics, Queue, Device, Volume, Mini-player and Fullscreen are grouped at the far right end of the bottom bar.
6. **Mini / Fullscreen** — Mini shows a compact overlay with *Restore*. Fullscreen uses the browser Fullscreen API with a Tauri fallback.

---

## Testing

```bash
python3 -m pytest tests/ -q   # Python unit tests (54 tests)
npm run build                 # Frontend production build must pass
npm run lint                  # oxlint
```

---

## Legal and Copyright

Libria is designed to respect copyright and platform terms:

- **No DRM circumvention.** Libria does not crack, bypass, or strip Spotify DRM. Spotify URLs are treated as *metadata references* only (title, artist, album fetched via public oEmbed). No Spotify audio is accessed directly.
- **User-provided sources.** The app only processes files you already own or links you paste. For Spotify links, audio is resolved by searching the public web (YouTube) via `yt-dlp` with a `ytsearch1:` query built from the title and artist. This is the same as a user manually searching YouTube.
- **Local, personal archiving.** Downloaded files are stored locally under your music directory for personal, offline playback. Libria does not host, redistribute, or share files with other users.
- **No streaming service impersonation.** Playback for local files uses your machine's audio backend (VLC / pygame) or the browser `HTMLAudioElement` over `/api/audio/:id` with standard HTTP range requests. No service is being re-streamed.
- **Attribution and licensing.** Tagging preserves original metadata (title, artist, album, year, cover). Lyrics are fetched from public lyric services (e.g., LRCLIB) and embedded as `USLT` only when available.
- **User responsibility.** You are responsible for ensuring you have the right to import and keep any content you add. Use Libria for content you own, have licensed, or that is in the public domain, in accordance with local law.

If you are a rights holder and believe content is being misused, please contact the project maintainers.

> **Disclaimer:** This project is for educational and personal-library purposes. It is not affiliated with or endorsed by Spotify AB.

---

## Configuration

- **Window** — `src-tauri/tauri.conf.json` (`titleBarStyle: Overlay`, `hiddenTitle: true`, `trafficLightPosition: {x:12, y:26}`)
- **API** — `src/api/backend.ts` uses `VITE_API_URL` (`/api` in browser, `http://localhost:12001/api` in Tauri, or `https://libria-api.onrender.com/api` in production)
- **Database** — `libria/db.py` seeds `~/.libria/libria.db` or Supabase when configured
- **Downloads** — `~/Music/libria/<Album>/` (album-aware)

---

## Contributing

1. Fork and create a feature branch.
2. Inspect `src/components/TopBar.tsx`, `src/components/PlayerBar.tsx` and `src/App.tsx` before changing navigation or playback.
3. Keep changes small and use the existing `zustand` stores and `invokeBackend` abstraction.
4. Run `python3 -m pytest tests/ -q` and `npm run build` before opening a pull request.

---

## License

MIT © Anthony Abah — see `src-tauri/Cargo.toml` for repository details.

