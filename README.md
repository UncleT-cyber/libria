# Libria — Your Music. Your Library. Your Way.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Tauri 2](https://img.shields.io/badge/Tauri-2.x-24c8db?logo=tauri)
![React 19](https://img.shields.io/badge/React-19-58c4dc?logo=react)
![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776ab?logo=python)
![Platform: macOS](https://img.shields.io/badge/platform-macOS-black)

Spotify-inspired desktop music player with a local-first library, high-quality archiving, and a native macOS shell. Libria ships as a **Tauri (Rust) + React** desktop app and a **Python (customtkinter + SQLite + yt-dlp + mutagen)** implementation sharing the same product spec.

> **Screenshot:** Top bar with traffic-light-aligned navigation (←/→), centered search + Home, and a bottom player whose center playback stays centered while `Lyrics` → `Fullscreen` is pinned flush to the far-right (<0.7 cm from the window edge) — Spotify parity.

---

## ✨ Features

- **Library** — Tracks, albums, artists, playlists with virtualized lists (`@tanstack/react-virtual`)
- **Import** — Scan a folder, import files, or paste any `open.spotify.com` / `spotify:` URL (track / album / playlist / show). Albums create a collection + placeholder row and queue via `ytsearch1:` → yt-dlp
- **Play-while-downloading** — Persistent daemon thread drains a `queue.Queue`; audio routes instantly (local file if archived, streaming URL otherwise), archival + ID3 tagging happens in background
- **Tagging** — `mutagen` ID3: `TIT2/TPE1/TALB/TYER` `encoding=3`, `APIC type=3` front cover, `USLT lang='eng'` (TYER → TDRC on v2.4)
- **Audio** — VLC → pygame → Null backend chain, `resolve_source` prefers `local_file_path`, `get_progress()` → `{elapsed_ms, total_ms, percent}`
- **Top bar** — Traffic-light `Overlay` at `(12,26)`, `←/→` tip-center aligned to traffic-light center, `h-[68px]` with ~8% larger Home/Search/Bell/Profile, hover + disabled states
- **Player bar** — `grid [1fr_auto_1fr]` keeps play controls viewport-centered; right group (`Lyrics`/`Queue`/`Device`/`Volume`/`Mini`/`Fullscreen`) is `justify-self-end` flush to the far-right
- **Mini player & Fullscreen** — Real state: Picture-in-Picture fallback + in-app mini overlay (`Restore`), browser Fullscreen API with Tauri `window.setFullscreen` fallback, synced `isMini`/`isFullscreen` active states
- **Modern UI** — Tailwind CSS 4, lucide-react icons, Zustand stores, dark theme, macOS rounded-square icon (black + neon-green `♫`)

---

## 🗂 Repository Layout

```
.
├── src/                 # Vite + React frontend
│   ├── components/      # TopBar, PlayerBar, Sidebar, LyricsPanel, QueuePanel, …
│   ├── stores/          # Zustand: library.ts, player.ts
│   ├── api/backend.ts   # HTTP → Python API (even inside Tauri webview) + isTauriWindow
│   ├── App.tsx          # History (back/forward), fullscreen, mini, panes
│   └── index.css        # Tailwind theme + spotify-range + eq animation
├── src-tauri/           # Tauri 2 shell (Rust)
│   ├── src/{audio,commands,database,download,filesystem,sources,utils}
│   ├── icons/           # icon.png / icon.icns (black neon ♫)
│   └── tauri.conf.json  # titleBarStyle Overlay, trafficLightPosition {12,26}
├── libria/              # Python implementation (active spec)
│   ├── db.py            # SQLite: PRAGMA foreign_keys=ON, tracks/favorites/collections/app_settings, thread-safe
│   ├── downloader.py    # PlaybackDownloadManager — queue.Queue + daemon, yt_dlp_archiver
│   ├── audio_controller.py, tagging.py, settings.py, spotify.py, lyrics.py, sync.py, server.py
│   └── ui/{router.py,pages.py,app.py}
├── main.py              # customtkinter entry → build_app()
├── tests/               # pytest — headless, no display required
└── dist/                # Vite build output (frontendDist for Tauri)
```

> **Two stacks:** `src/` + `src-tauri/` is the shipped desktop binary (`Libria.app`). `libria/` + `main.py` + `tests/` is the Python spec implementation (customtkinter GUI, SQLite ledger). Both share the same `libria/server.py` HTTP bridge.

---

## 🚀 Quick Start

### Prerequisites

- **Node 20+**, **npm 10+**, **Rust 1.77+**, **Python 3.10+**
- **macOS** recommended (traffic-light `Overlay`), Linux/Windows via Tauri targets
- Optional: `ffmpeg` (for yt-dlp `FFmpegExtractAudio` → 320 kbps MP3), `vlc`/`pygame`

### 1. Python API (port 12001)

```bash
pip install -r requirements.txt        # customtkinter, mutagen, yt-dlp, fastapi, uvicorn, python-vlc
python -m libria.server 12001         # → http://localhost:12001  (supabase off → SQLite at ~/.libria/libria.db)
# or with Supabase:  SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… python -m libria.server
```

Endpoints: `GET /api/health`, `GET /api/get_library`, `POST /api/import_spotify`, `POST /api/play_track` (queues ytsearch download, waits ≤15 s), `GET /api/audio/:id` (Range), `POST /api/fetch_lyrics` (LRCLIB), `POST /api/create_playlist`, etc.

CORS `*`, `Accept-Ranges: bytes`.

### 2. Frontend (Vite)

```bash
npm install
npm run dev          # → http://localhost:5174  (proxies /api → :12001)
```

The Tauri webview loads `http://localhost:5174` in dev (`beforeDevCommand`).

### 3. Desktop App (Tauri)

```bash
npm run build        # tsc + vite → dist/
# dev shell (Vite + Tauri):
npx tauri dev
# release bundle:
cargo build --release --manifest-path src-tauri/Cargo.toml
# → src-tauri/target/release/bundle/macos/Libria.app
open src-tauri/target/release/bundle/macos/Libria.app
# quarantine clear after copy:
xattr -cr src-tauri/target/release/bundle/macos/Libria.app
```

### 4. Python Desktop (customtkinter)

```bash
python main.py       # requires display; not for CI
```

---

## 🎧 How to Use

1. **Add music** — In *Your Library* click `+` → `Add music` → *Scan folder* / *Import files* / *Paste Spotify URL*. Example: `https://open.spotify.com/album/7AwrgenNcTAJlJF3pKL0Qr`
2. **Album flow** — Album URL creates a collection (`album:ID`) and enqueues the title via `ytsearch1:"{title} {artist}"` → `~/Music/libria/<Album>/…mp3` with ID3 + optional lyrics (LRCLIB `plainLyrics`/`syncedLyrics` → DB `lyrics` + `USLT`)
3. **Play** — Click a track or press `Play`. First stream triggers `POST /api/play_track` (auto-download), `HEAD /api/audio/:id` guard, then `HTMLAudioElement` at `GET /api/audio/:id` (Range). Subsequent plays are zero-buffer from local file.
4. **Top navigation** — `←/→` use App history (`history`/`historyIdx` in `App.tsx`), not `window.history`; disabled when no back/forward, hover enlarges hit-area 36 px.
5. **Bottom player** — Left: artwork/title/artist. Center: shuffle/prev/play/next/repeat + seek (4 px track, 12 px thumb on hover). Right: `Lyrics` / `Queue` (green dot) / `Device` / `Volume` / `Mini` / `Fullscreen` — grid keeps center centered, right is `justify-self-end pr-0` within `gap-4` + outer `px-0` (≈0.2 cm from window edge).
6. **Mini** — Toggles in-app overlay (`Libria Mini Player` + `Restore`) and best-effort `documentPictureInPicture`; audio element is singleton, no duplicate engine, track state preserved.
7. **Fullscreen** — `document.documentElement.requestFullscreen()` with `fullscreenchange` sync; Tauri fallback `window.__TAURI__.window.getCurrentWindow().setFullscreen`; active green dot.
8. **Queue / Lyrics / Device** — Right-side toggles for `QueuePanel`, `LyricsPanel` (reads `track.lyrics`), `DevicePanel`.

---

## 🧪 Testing & Verification

```bash
# Python unit tests (headless)
python3 -m pytest tests/ -q        # 54 passed (spotify, db, downloader, router, server, tagging …)

# Frontend build
npm run build
npm run lint   # oxlint

# Manual checklist (do not skip before release)
# [ ] Back/forward visible, tip-center aligned y~32, functional, disabled states
# [ ] Top h-[68px] Home 52px Search 52px 17px — ~8% larger, no wrap
# [ ] Bottom center stays centered, right group flush far-right (<0.7 cm)
# [ ] Mini toggles + Restore, no audio duplicate
# [ ] Fullscreen enters/exits, state syncs, no console errors
# [ ] Play/Pause/Next/Prev/Shuffle/Repeat/Seek/Volume intact
```

---

## 🔧 Configuration

| Key | Where | Notes |
|-----|-------|-------|
| `trafficLightPosition` | `src-tauri/tauri.conf.json` | `{x:12,y:26}`, `titleBarStyle Overlay`, `hiddenTitle true` |
| `VITE_API_URL` | `src/api/backend.ts` | Browser: `/api` (Vite proxy) · Tauri: `http://localhost:12001/api` · Prod: `https://libria-api.onrender.com/api` |
| `LIBRIA_DB_PATH` / `~/.libria/libria.db` | `libria/server.py` | Falls back to Supabase when `SUPABASE_URL` set |
| `download_directory` | `libria/db.py` SEED → `./downloads` / `~/Music/libria` | Album-aware `yt_dlp_archiver` creates `<dest>/<Album>/` |

---

## 📦 Build & Release

```bash
npm run build && cargo build --release --manifest-path src-tauri/Cargo.toml
# icons: src-tauri/icons/icon.png (1024) → icon.icns (iconutil) + icon.ico (Pillow)
# bundle: src-tauri/target/release/bundle/macos/Libria.app
```

CI: keep `customtkinter` imports only in `libria/ui/pages.py`, `libria/ui/app.py`, `main.py` (no display in CI).

---

## 🤝 Contributing

1. Fork, branch, inspect `src/components/{TopBar,PlayerBar}` and `src/App.tsx` before touching navigation/player.
2. Use existing stores (`zustand`), `invokeBackend` abstraction, Tailwind tokens.
3. Smallest clean diff, no `window.history.back()` unless appropriate, no duplicate audio elements.
4. `python3 -m pytest tests/ -q` and `npm run build` must pass.

---

## 📄 License

MIT © Anthony Abah — see `src-tauri/Cargo.toml` (`repository: https://github.com/UncleT-cyber/libria`).
