import { create } from 'zustand';
import { invokeBackend } from '../api/backend';

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
  format: string;
}

export interface LibraryStats {
  total_tracks: number;
  total_albums: number;
  total_artists: number;
}

interface RawTrack {
  track_id: string;
  id?: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration: number | null;
  duration_ms: number | null;
  local_file_path: string | null;
  file_path?: string | null;
  format?: string;
}

const normalizeTrack = (raw: RawTrack): Track => ({
  id: raw.track_id ?? raw.id ?? '',
  title: raw.title,
  artist: raw.artist ?? 'Unknown Artist',
  album: raw.album ?? '',
  duration: raw.duration ?? (raw.duration_ms ? raw.duration_ms / 1000 : 0),
  file_path: raw.local_file_path ?? raw.file_path ?? '',
  format: raw.format ?? '',
});

interface LibraryStore {
  tracks: Track[];
  stats: LibraryStats | null;
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  fetchLibrary: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  scanFolder: (folderPath: string) => Promise<void>;
  importFiles: (filePaths: string[]) => Promise<void>;
  importSpotify: (url: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  tracks: [],
  stats: null,
  favorites: [],
  isLoading: false,
  error: null,

  fetchLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawTracks = await invokeBackend('get_library') as unknown as RawTrack[];
      const tracks = rawTracks.map(normalizeTrack);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const favorites = await invokeBackend('get_favorites');
      set({ favorites });
    } catch (error) {
      set({ error: toMessage(error) });
    }
  },

  toggleFavorite: async (trackId: string) => {
    try {
      const result = await invokeBackend('toggle_favorite', { track_id: trackId });
      set({ favorites: result.favorites });
    } catch (error) {
      set({ error: toMessage(error) });
    }
  },
  
  scanFolder: async (folderPath: string) => {
    set({ isLoading: true, error: null });
    try {
      await invokeBackend('scan_folder', { folderPath });
      // Refresh library after scan
      const rawTracks = await invokeBackend('get_library') as unknown as RawTrack[];
      const tracks = rawTracks.map(normalizeTrack);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },
  
  importFiles: async (filePaths: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await invokeBackend('import_files', { filePaths });
      // Refresh library after import
      const rawTracks = await invokeBackend('get_library') as unknown as RawTrack[];
      const tracks = rawTracks.map(normalizeTrack);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  importSpotify: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      await invokeBackend('import_spotify', { url });
      const rawTracks = await invokeBackend('get_library') as unknown as RawTrack[];
      const tracks = rawTracks.map(normalizeTrack);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },
}));