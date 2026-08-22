import { create } from 'zustand';

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: string | null;
  position: number;
  duration: number;
  volume: number;
}

interface PlayerStore {
  state: PlayerState;
  playTrack: (trackId: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  seekPlayback: (position: number) => Promise<void>;
  setVolume: (volume: number) => void;
  fetchPlayerState: () => Promise<void>;
  tick: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  state: {
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 1.0,
  },
  
  playTrack: async (trackId: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('play_track', { trackId });
      set((state) => ({
        state: { 
          ...state.state, 
          isPlaying: true, 
          currentTrack: trackId,
          position: 0,
          duration: 0 // Will be set by actual audio player
        }
      }));
      
      // Start progress simulation (will be replaced by real audio player)
      const interval = setInterval(() => {
        const currentState = get().state;
        if (currentState.isPlaying && currentState.duration > 0 && currentState.position < currentState.duration) {
          set((state) => ({
            state: { ...state.state, position: currentState.position + 1 }
          }));
        } else if (currentState.position >= currentState.duration && currentState.duration > 0) {
          clearInterval(interval);
          set((state) => ({
            state: { ...state.state, isPlaying: false, position: 0 }
          }));
        }
      }, 1000);
      
      // Store interval ID for cleanup (simplified)
      (set as any)({ progressInterval: interval });
      
    } catch (error) {
      console.error('Failed to play track:', error);
      // Still update UI state even if backend fails
      set((state) => ({
        state: { 
          ...state.state, 
          isPlaying: true, 
          currentTrack: trackId,
          position: 0,
          duration: 0
        }
      }));
    }
  },
  
  pausePlayback: async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('pause_playback');
      set((state) => ({
        state: { ...state.state, isPlaying: false }
      }));
    } catch (error) {
      console.error('Failed to pause playback:', error);
      set((state) => ({
        state: { ...state.state, isPlaying: false }
      }));
    }
  },
  
  stopPlayback: async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('stop_playback');
      set((state) => ({
        state: { ...state.state, isPlaying: false, currentTrack: null, position: 0 }
      }));
    } catch (error) {
      console.error('Failed to stop playback:', error);
      set((state) => ({
        state: { ...state.state, isPlaying: false, currentTrack: null, position: 0 }
      }));
    }
  },
  
  seekPlayback: async (position: number) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('seek_playback', { position });
      set((state) => ({
        state: { ...state.state, position }
      }));
    } catch (error) {
      console.error('Failed to seek playback:', error);
    }
  },
  
  setVolume: (volume: number) => {
    set((state) => ({
      state: { ...state.state, volume }
    }));
  },
  
  fetchPlayerState: async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const playerState = await invoke<PlayerState>('get_player_state');
      set({ state: playerState });
    } catch (error) {
      console.error('Failed to fetch player state:', error);
    }
  },
  
  tick: () => {
    const currentState = get().state;
    if (currentState.isPlaying && currentState.position < currentState.duration) {
      set((state) => ({
        state: { ...state.state, position: currentState.position + 1 }
      }));
    } else if (currentState.position >= currentState.duration) {
      set((state) => ({
        state: { ...state.state, isPlaying: false, position: 0 }
      }));
    }
  },
}));