import type { Track, LibraryStats } from '../stores/library';

// Same-origin relative base: the Vite dev server proxies /api -> the Python
// backend, so HTTPS hosting faces no mixed-content blocking.
const API_BASE = '/api';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isTauri =
  typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

// Commands mirrored by both the Tauri Rust backend and libria/server.py
interface CommandMap {
  get_library: { args: never; return: Track[] };
  get_library_stats: { args: never; return: LibraryStats };
  scan_folder: { args: { folderPath: string }; return: unknown };
  import_files: { args: { filePaths: string[] }; return: unknown };
  import_spotify: { args: { url: string }; return: { track: Record<string, unknown>; enqueued: boolean } };
  get_settings: { args: never; return: Record<string, string> };
  set_setting: { args: { key: string; value: string }; return: unknown };
  get_downloads: { args: never; return: [string, string][] };
  get_favorites: { args: never; return: string[] };
  toggle_favorite: { args: { track_id: string }; return: { favorites: string[] } };
  get_player_state: { args: never; return: unknown };
  play_track: { args: { trackId: string }; return: unknown };
  pause_playback: { args: never; return: unknown };
  stop_playback: { args: never; return: unknown };
  seek_playback: { args: { position: number }; return: unknown };
}

export const audioUrl = (trackId: string): string =>
  `${API_BASE}/audio/${encodeURIComponent(trackId)}`;

type Command = keyof CommandMap;

export async function invokeBackend<C extends Command>(
  command: C,
  args?: CommandMap[C]['args'],
): Promise<CommandMap[C]['return']> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<CommandMap[C]['return']>(command, args as never);
  }

  const GET_COMMANDS: Command[] = [
    'get_library',
    'get_library_stats',
    'get_settings',
    'get_downloads',
    'get_favorites',
    'get_player_state',
  ];
  if (GET_COMMANDS.includes(command)) {
    const response = await fetch(`${API_BASE}/${command}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error ?? response.statusText);
    return body as CommandMap[C]['return'];
  }

  const response = await fetch(`${API_BASE}/${command}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args ?? {}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error ?? response.statusText);
  }
  return body as CommandMap[C]['return'];
}
