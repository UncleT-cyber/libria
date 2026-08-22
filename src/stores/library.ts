import { create } from 'zustand';

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

interface LibraryStore {
  tracks: Track[];
  stats: LibraryStats | null;
  isLoading: boolean;
  error: string | null;
  fetchLibrary: () => Promise<void>;
  scanFolder: (folderPath: string) => Promise<void>;
  importFiles: (filePaths: string[]) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  tracks: [],
  stats: null,
  isLoading: false,
  error: null,
  
  fetchLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const tracks = await invoke<Track[]>('get_library');
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },
  
  scanFolder: async (folderPath: string) => {
    set({ isLoading: true, error: null });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('scan_folder', { folderPath });
      // Refresh library after scan
      const tracks = await invoke<Track[]>('get_library');
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },
  
  importFiles: async (filePaths: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('import_files', { filePaths });
      // Refresh library after import
      const tracks = await invoke<Track[]>('get_library');
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ error: error as string, isLoading: false });
    }
  },
}));