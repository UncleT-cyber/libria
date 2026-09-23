import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useState } from 'react';
import {
  PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon,
  MusicNoteIcon, PlayerPencilIcon, PlayerQueueIcon,
  VolumeIcon, VolumeMuteIcon, PlayerFullscreenIcon,
  PlayerMiniIcon, PlayerDeviceIcon,
} from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const pct = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

type RightPane = 'lyrics' | 'queue' | 'device' | null;

interface PlayerBarProps {
  onFullscreen: () => void;
  activePane?: RightPane;
  isMiniActive?: boolean;
  isFullscreenActive?: boolean;
  onToggleLyrics?: () => void;
  onToggleQueue?: () => void;
  onToggleDevice?: () => void;
  onToggleMini?: () => void;
  onToggleNowPlaying?: () => void;
}

export default function PlayerBar({ onFullscreen, activePane, isMiniActive, isFullscreenActive, onToggleLyrics, onToggleQueue, onToggleDevice, onToggleMini, onToggleNowPlaying }: PlayerBarProps) {
  const {
    state, playTrack, pausePlayback, stopPlayback, seekPlayback, setVolume,
    shuffle, repeatMode, toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { tracks, favorites, toggleFavorite } = useLibraryStore();
  const [muted, setMuted] = useState(false);

  const activeTrack = tracks.find((t) => t.id === state.currentTrack);
  const playable = tracks.filter((t) => !!t.file_path);
  const playNeighbor = (dir: 1 | -1) => {
    if (playable.length === 0) return;
    const curPlayIdx = playable.findIndex((t) => t.id === state.currentTrack);
    const nextIdx = curPlayIdx === -1 ? 0 : (curPlayIdx + dir + playable.length) % playable.length;
    playTrack(playable[nextIdx].id);
  };

  const togglePlay = () => {
    if (state.isPlaying) {
      pausePlayback();
    } else if (state.currentTrack) {
      playTrack(state.currentTrack);
    }
  };

  const isLiked = Boolean(state.currentTrack && favorites.includes(state.currentTrack));
  const volumeShown = muted ? 0 : state.volume;
  const progressPct = state.duration > 0 ? (state.position / state.duration) * 100 : 0;

  return (
    <div
      className="h-[72px] w-full bg-black"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr 1fr',
        alignItems: 'center',
        columnGap: 12,
        padding: '0 8px 0 4px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, justifySelf: 'start' }}>
        <button onClick={onToggleNowPlaying} title="Now playing view" className="h-16 w-16 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
          {activeTrack?.artwork_url ? (
            <img src={activeTrack.artwork_url} alt={activeTrack.album || activeTrack.title} className="w-full h-full object-cover" />
          ) : (
            <MusicNoteIcon className={`h-7 w-7 ${activeTrack ? '' : 'opacity-50'}`} />
          )}
        </button>
        <div className="min-w-0">
          <button
            onClick={() => {
              if (activeTrack && state.currentTrack) playTrack(activeTrack.id);
            }}
            title={activeTrack ? `Open ${activeTrack.title}` : 'Your library'}
            className="block max-w-[220px] truncate text-left text-base leading-5 text-white hover:underline"
          >
            {activeTrack?.title ?? 'Libria'}
          </button>
          <button
            onClick={() => {
              if (activeTrack) playTrack(activeTrack.id);
            }}
            title={activeTrack ? activeTrack.artist : 'Select a track from Your Library'}
            className="block max-w-[220px] truncate text-left text-[13px] leading-4 text-[#a7a7a7] hover:text-white hover:underline"
          >
            {activeTrack?.artist ?? 'Select a track'}
          </button>
        </div>
        {activeTrack && (
          <>
            <button
              onClick={() => stopPlayback()}
              title="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#b3b3b3] hover:text-white"
            >
              <span className="text-lg leading-none">×</span>
            </button>
            <button
              onClick={() => state.currentTrack && toggleFavorite(state.currentTrack)}
              title={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${isLiked ? 'border-white bg-white text-black' : 'border-[#6a6a6a] text-[#b3b3b3] hover:border-white hover:text-white'}`}
            >
              {isLiked ? '✓' : '+'}
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', width: '100%', maxWidth: 540 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            title="Enable shuffle"
            className={`relative flex h-8 w-8 items-center justify-center ${shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <ShuffleIcon className="h-4 w-4" />
            {shuffle && <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1DB954]" />}
          </button>
          <button onClick={() => playNeighbor(-1)} title="Previous" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
            <PrevIcon className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            title={state.isPlaying ? 'Pause' : 'Play'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105"
          >
            {state.isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
          </button>
          <button onClick={() => playNeighbor(1)} title="Next" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
            <NextIcon className="h-4 w-4" />
          </button>
          <button
            onClick={cycleRepeat}
            title={repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Enable repeat' : 'Enable repeat one'}
            className={`relative flex h-8 w-8 items-center justify-center ${repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <RepeatIcon className="h-4 w-4" />
            {repeatMode !== 'off' && (
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${repeatMode === 'one' ? 'text-[8px] font-bold leading-none' : 'h-1 w-1 rounded-full bg-[#1DB954]'}`}>
                {repeatMode === 'one' ? '1' : ''}
              </span>
            )}
          </button>
        </div>
        <div className="mt-1 flex w-full items-center gap-2 text-[11px] text-[#a7a7a7]">
          <span className="w-10 text-right tabular-nums">{fmt(state.position)}</span>
          <input
            type="range"
            min={0}
            max={Math.floor(state.duration) || 0}
            value={Math.floor(Math.min(state.position, state.duration))}
            onChange={(e) => seekPlayback(Number(e.target.value))}
            className="spotify-range h-1 flex-1"
            style={{ background: `linear-gradient(to right, #fff ${pct(progressPct)}, #4d4d4d ${pct(progressPct)})` }}
          />
          <span className="w-10 tabular-nums">{fmt(state.duration)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', justifySelf: 'end', width: '100%', gap: 2 }}>
        <button onClick={onToggleNowPlaying} title="Now playing" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <PlayerPencilIcon className="h-4 w-4" />
        </button>
        <button onClick={onToggleQueue} title="Queue" className={`relative flex h-8 w-8 items-center justify-center ${activePane === 'queue' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}>
          <PlayerQueueIcon className="h-4 w-4" />
          {activePane === 'queue' && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1DB954]" />}
        </button>
        <button onClick={onToggleDevice} title="Connect to a device" className={`flex h-8 w-8 items-center justify-center ${activePane === 'device' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}>
          <PlayerDeviceIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setMuted(!muted)}
          title="Mute"
          className="ml-1 flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white"
        >
          {muted || state.volume === 0 ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volumeShown}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            setMuted(v === 0);
          }}
          aria-label="Volume"
          className="spotify-range hidden h-1 w-[93px] sm:block"
          style={{ background: `linear-gradient(to right, #fff ${pct(volumeShown * 100)}, #535353 ${pct(volumeShown * 100)})` }}
        />
        <button onClick={onFullscreen} title={isFullscreenActive ? 'Exit full screen' : 'Full screen'} className={`ml-1 flex h-8 w-8 items-center justify-center ${isFullscreenActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
          <PlayerFullscreenIcon className="h-4 w-4" />
        </button>
        <button onClick={onToggleMini} title={isMiniActive ? 'Exit mini player' : 'Mini player'} className={`flex h-8 w-8 items-center justify-center ${isMiniActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
          <PlayerMiniIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
