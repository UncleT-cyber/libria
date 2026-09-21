import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useState } from 'react';
import {
  PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon,
  HeartIcon, CheckCircleIcon, MusicNoteIcon, MicIcon, QueueIcon,
  VolumeIcon, VolumeMuteIcon, FullscreenIcon, NowPlayingIcon,
  MiniPlayerIcon, DeviceIcon,
} from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const pct = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

type RightPane = 'nowPlaying' | 'lyrics' | 'queue' | 'device' | null;

interface PlayerBarProps {
  nowPlayingOpen: boolean;
  onToggleNowPlaying: () => void;
  onFullscreen: () => void;
  activePane?: RightPane;
  onToggleLyrics?: () => void;
  onToggleQueue?: () => void;
  onToggleDevice?: () => void;
  onToggleMini?: () => void;
}

export default function PlayerBar({ nowPlayingOpen, onToggleNowPlaying, onFullscreen, activePane, onToggleLyrics, onToggleQueue, onToggleDevice, onToggleMini }: PlayerBarProps) {
  const {
    state, playTrack, pausePlayback, seekPlayback, setVolume,
    shuffle, repeatMode, toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { tracks, favorites, toggleFavorite } = useLibraryStore();
  const [muted, setMuted] = useState(false);

  const activeTrack = tracks.find((t) => t.id === state.currentTrack);
  const currentIndex = tracks.findIndex((t) => t.id === state.currentTrack);

  const playNeighbor = (dir: 1 | -1) => {
    if (tracks.length === 0) return;
    const nextIdx = currentIndex === -1 ? 0 : (currentIndex + dir + tracks.length) % tracks.length;
    playTrack(tracks[nextIdx].id);
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
    <div className="h-[72px] flex-shrink-0 bg-black px-4 flex items-center justify-between gap-4">
      {/* Left (Track Info): 56x56 cover, title 14px bold, artist 11px grey, heart stroke 2px */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px] max-w-sm">
        <div className="w-14 h-14 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 overflow-hidden">
          {activeTrack?.artwork_url ? (
            <img src={activeTrack.artwork_url} alt={activeTrack.album || activeTrack.title} className="w-full h-full object-cover" />
          ) : activeTrack ? (
            <MusicNoteIcon className="w-6 h-6" />
          ) : (
            <MusicNoteIcon className="w-6 h-6 opacity-50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <button className="block text-[14px] leading-5 text-white hover:underline truncate font-normal text-left max-w-full">
            {activeTrack?.title ?? 'Libria'}
          </button>
          <button className="block text-[11px] leading-4 text-[#a7a7a7] hover:text-white hover:underline truncate text-left max-w-full">
            {activeTrack?.artist ?? 'Select a track'}
          </button>
        </div>
        {activeTrack && (
          <>
            <button
              onClick={() => state.currentTrack && toggleFavorite(state.currentTrack)}
              disabled={!state.currentTrack}
              title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              className={`flex-shrink-0 p-1 transition-colors ${isLiked ? 'text-[#1DB954] hover:scale-105' : 'text-[#b3b3b3] hover:text-white'}`}
            >
              {isLiked ? <CheckCircleIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            </button>
            <button title="Close" className="w-6 h-6 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white transition-colors">
              <span className="text-sm leading-none">×</span>
            </button>
            <button title="Add to playlist" className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2a2a2a] text-[#b3b3b3] hover:text-white hover:bg-[#3e3e3e] transition-colors">
              <span className="text-sm leading-none">+</span>
            </button>
          </>
        )}
      </div>

      {/* Center core: 32px white play circle, 16px gaps, 4px timeline + handle */}
      <div className="flex flex-col items-center gap-2 w-[40%] max-w-[722px]">
        <div className="flex items-center">
          <button
            onClick={toggleShuffle}
            title="Enable shuffle"
            className={`relative w-8 h-8 flex items-center justify-center transition-colors ${shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <ShuffleIcon className="w-4 h-4" />
            {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
          </button>
          <button onClick={() => playNeighbor(-1)} title="Previous" className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors">
            <PrevIcon className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            title={state.isPlaying ? 'Pause' : 'Play'}
            className="mx-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#f0f0f0] transition-all shadow-sm"
          >
            {state.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={() => playNeighbor(1)} title="Next" className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors">
            <NextIcon className="w-4 h-4" />
          </button>
          <button
            onClick={cycleRepeat}
            title={repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Enable repeat' : 'Enable repeat one'}
            className={`relative w-8 h-8 flex items-center justify-center transition-colors ${repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <RepeatIcon className="w-4 h-4" />
            {repeatMode !== 'off' && (
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${repeatMode === 'one' ? 'text-[8px] font-bold leading-none' : 'w-1 h-1 rounded-full bg-[#1DB954]'}`}>
                {repeatMode === 'one' ? '1' : ''}
              </span>
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-[11px] text-[#a7a7a7] font-normal">
          <span className="w-10 text-right tabular-nums">{fmt(state.position)}</span>
          <input
            type="range"
            min={0}
            max={Math.floor(state.duration) || 0}
            value={Math.floor(Math.min(state.position, state.duration))}
            onChange={(e) => seekPlayback(Number(e.target.value))}
            className="spotify-range flex-1 h-1"
            style={{ background: `linear-gradient(to right, #fff ${pct(progressPct)}, #4d4d4d ${pct(progressPct)})` }}
          />
          <span className="w-10 tabular-nums">{fmt(state.duration)}</span>
        </div>
      </div>

      {/* Right (Utility Icons): fully functional - nowPlaying, lyrics, queue, device, mini, volume, fullscreen */}
      <div className="flex items-center gap-3 w-[30%] justify-end min-w-[180px] h-full">
        <button
          onClick={onToggleNowPlaying}
          title="Now playing view"
          className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-colors ${nowPlayingOpen || activePane === 'nowPlaying' ? 'text-[#1DB954] bg-[#232323]' : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'}`}
        >
          <NowPlayingIcon className="w-4 h-4" />
          {(nowPlayingOpen || activePane === 'nowPlaying') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
        </button>
        <button onClick={onToggleLyrics} title="Lyrics" className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${activePane === 'lyrics' ? 'text-[#1DB954] bg-[#232323]' : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'}`}>
          <MicIcon className="w-4 h-4" />
        </button>
        <button onClick={onToggleQueue} title="Queue" className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${activePane === 'queue' ? 'text-[#1DB954] bg-[#232323]' : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'}`}>
          <QueueIcon className="w-4 h-4" />
        </button>
        <button onClick={onToggleDevice} title="Connect to a device" className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${activePane === 'device' ? 'text-[#1DB954] bg-[#232323]' : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'}`}>
          <DeviceIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(!muted)} title="Mute" className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors">
            {muted || state.volume === 0 ? <VolumeMuteIcon className="w-4 h-4" /> : <VolumeIcon className="w-4 h-4" />}
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
            className="spotify-range w-[93px]"
            style={{ background: `linear-gradient(to right, #fff ${pct(volumeShown * 100)}, #4d4d4d ${pct(volumeShown * 100)})` }}
          />
        </div>
        <button onClick={onToggleMini} title="Mini player (Picture-in-Picture)" className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors">
          <MiniPlayerIcon className="w-4 h-4" />
        </button>
        <button onClick={onFullscreen} title="Full screen" className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors">
          <FullscreenIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
