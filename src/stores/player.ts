import { create } from 'zustand';
import { isTauri, audioUrl } from '../api/backend';

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: string | null;
  position: number;
  duration: number;
  volume: number;
}

interface PlayerStore {
  state: PlayerState;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playTrack: (trackId: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  seekPlayback: (position: number) => Promise<void>;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  fetchPlayerState: () => Promise<void>;
  tick: () => void;
}

// Browser-mode playback engine: a singleton HTMLAudioElement fed by the
// /api/audio endpoint on the Python backend (spec section 6 state machine).
let audioElement: HTMLAudioElement | null = null;
let detachAudio: (() => void) | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'auto';
  }
  return audioElement;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  const syncFromAudio = (audio: HTMLAudioElement) => {
    set((state) => ({
      state: {
        ...state.state,
        position: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : state.state.duration,
      },
    }));
  };

  const attachAudio = (audio: HTMLAudioElement) => {
    detachAudio?.();
    const onTime = () => syncFromAudio(audio);
    const onMeta = () =>
      set((state) => ({
        state: { ...state.state, duration: Number.isFinite(audio.duration) ? audio.duration : 0 },
      }));
    const onEnded = () =>
      set((state) => ({ state: { ...state.state, isPlaying: false, position: 0 } }));
    const onError = () =>
      set((state) => ({ state: { ...state.state, isPlaying: false } }));
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    detachAudio = () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  };

  return {
    state: {
      isPlaying: false,
      currentTrack: null,
      position: 0,
      duration: 0,
      volume: 1.0,
    },
    shuffle: false,
    repeatMode: 'off',

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
    cycleRepeat: () =>
      set((s) => ({
        repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
      })),

    playTrack: async (trackId: string) => {
      if (!isTauri) {
        // Guard: album placeholders (album:...) and stream-only tracks have no file yet -> 404
        // Check via /api/audio HEAD or via library store before attempting playback.
        try {
          const head = await fetch(audioUrl(trackId), { method: 'HEAD' });
          if (!head.ok) {
            const isAlbum = trackId.startsWith('album:') || trackId.startsWith('playlist:');
            const hint = isAlbum
              ? 'Album placeholder - paste individual track URLs or wait for yt-dlp search'
              : 'Not yet downloaded - wait for archiver or re-import (check /api/get_downloads)';
            console.warn(`Browser playback unavailable for track ${trackId}: ${head.status} ${hint}`);
            set((state) => ({
              state: { ...state.state, isPlaying: false, currentTrack: trackId, position: 0, duration: 0 },
            }));
            return;
          }
        } catch {
          // HEAD failed (CORS/network) - fall through to audio.play attempt
        }
        const audio = getAudio();
        audio.src = audioUrl(trackId);
        attachAudio(audio);
        audio.volume = get().state.volume;
        try {
          await audio.play();
          set((state) => ({
            state: { ...state.state, isPlaying: true, currentTrack: trackId, position: 0 },
          }));
        } catch (error) {
          // No local archive (stream-only track) or decode failure: surface as idle.
          console.warn('Browser playback unavailable for track:', trackId, error);
          set((state) => ({
            state: { ...state.state, isPlaying: false, currentTrack: trackId, position: 0, duration: 0 },
          }));
        }
        return;
      }
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('play_track', { trackId });
        set((state) => ({
          state: {
            ...state.state,
            isPlaying: true,
            currentTrack: trackId,
            position: 0,
            duration: 0, // Will be set by actual audio player
          },
        }));

        // Start progress simulation (will be replaced by real audio player)
        const interval = setInterval(() => {
          const currentState = get().state;
          if (currentState.isPlaying && currentState.duration > 0 && currentState.position < currentState.duration) {
            set((state) => ({
              state: { ...state.state, position: currentState.position + 1 },
            }));
          } else if (currentState.position >= currentState.duration && currentState.duration > 0) {
            clearInterval(interval);
            set((state) => ({
              state: { ...state.state, isPlaying: false, position: 0 },
            }));
          }
        }, 1000);

        // Store interval ID for cleanup (simplified)
        (set as any)({ progressInterval: interval });
      } catch (error) {
        console.error('Failed to play track:', error);
        set((state) => ({
          state: {
            ...state.state,
            isPlaying: true,
            currentTrack: trackId,
            position: 0,
            duration: 0,
          },
        }));
      }
    },

    pausePlayback: async () => {
      if (!isTauri) {
        audioElement?.pause();
        set((state) => ({ state: { ...state.state, isPlaying: false } }));
        return;
      }
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('pause_playback');
        set((state) => ({
          state: { ...state.state, isPlaying: false },
        }));
      } catch (error) {
        console.error('Failed to pause playback:', error);
        set((state) => ({
          state: { ...state.state, isPlaying: false },
        }));
      }
    },

    stopPlayback: async () => {
      if (!isTauri) {
        audioElement?.pause();
        if (audioElement) audioElement.currentTime = 0;
        set((state) => ({
          state: { ...state.state, isPlaying: false, currentTrack: null, position: 0 },
        }));
        return;
      }
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('stop_playback');
        set((state) => ({
          state: { ...state.state, isPlaying: false, currentTrack: null, position: 0 },
        }));
      } catch (error) {
        console.error('Failed to stop playback:', error);
        set((state) => ({
          state: { ...state.state, isPlaying: false, currentTrack: null, position: 0 },
        }));
      }
    },

    seekPlayback: async (position: number) => {
      if (!isTauri) {
        if (audioElement) audioElement.currentTime = position;
        set((state) => ({ state: { ...state.state, position } }));
        return;
      }
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('seek_playback', { position });
        set((state) => ({
          state: { ...state.state, position },
        }));
      } catch (error) {
        console.error('Failed to seek playback:', error);
      }
    },

    setVolume: (volume: number) => {
      if (!isTauri && audioElement) {
        audioElement.volume = volume;
      }
      set((state) => ({
        state: { ...state.state, volume },
      }));
    },

    fetchPlayerState: async () => {
      if (!isTauri) return;
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const playerState = await invoke<PlayerState>('get_player_state');
        set({ state: playerState });
      } catch (error) {
        console.error('Failed to fetch player state:', error);
      }
    },

    tick: () => {
      if (!isTauri) return; // position comes from audio 'timeupdate' events
      const currentState = get().state;
      if (currentState.isPlaying && currentState.position < currentState.duration) {
        set((state) => ({
          state: { ...state.state, position: currentState.position + 1 },
        }));
      } else if (currentState.position >= currentState.duration) {
        set((state) => ({
          state: { ...state.state, isPlaying: false, position: 0 },
        }));
      }
    },
  };
});
