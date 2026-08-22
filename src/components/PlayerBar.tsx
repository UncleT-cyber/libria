import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useState } from 'react';
import {
  PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon,
  HeartIcon, HeartFilledIcon, MusicNoteIcon, MicIcon, QueueIcon,
  VolumeIcon, VolumeMuteIcon, FullscreenIcon, NowPlayingIcon,
} from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface PlayerBarProps {
  nowPlayingOpen: boolean;
  onToggleNowPlaying: () => void;
}

export default function PlayerBar({ nowPlayingOpen, onToggleNowPlaying }: PlayerBarProps) {
  const {
    state, playTrack, pausePlayback, seekPlayback, setVolume,
    shuffle, repeatMode, toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const activeTrack = tracks.find((t) => t.id === state.currentTrack);
  const currentIndex = tracks.findIndex((t) => t.id === state.currentTrack);

  const playNeighbor = (dir: 1 | -1) => {
    if (tracks.length === 0) return;
    const order = shuffle ? tracks.slice().sort(() => Math.random() - 0.5) : tracks;
    const idx = shuffle ? order.findIndex((t) => t.id === state.currentTrack) : currentIndex;
    const nextIdx = idx === -1 ? 0 : (idx + dir + order.length) % order.length;
    playTrack(order[nextIdx].id);
  };

  const togglePlay = () => {
    if (state.isPlaying) {
      pausePlayback();
    } else if (state.currentTrack) {
      playTrack(state.currentTrack);
    }
  };

  const isLiked = state.currentTrack ? liked[state.currentTrack] : false;

  return (
    <div className="h-[72px] flex-shrink-0 bg-black px-4 flex items-center justify-between gap-4">
      {/* Left: track info */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px] max-w-sm">
        <div className="w-14 h-14 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0">
          <MusicNoteIcon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <button className="block text-sm text-white hover:underline truncate font-medium text-left">
            {activeTrack?.title ?? 'Libria'}
          </button>
          <button className="block text-[11px] text-[#b3b3b3] hover:text-white hover:underline truncate text-left">
            {activeTrack?.artist ?? 'Select a track'}
          </button>
        </div>
        <button
          onClick={() => state.currentTrack && setLiked((l) => ({ ...l, [state.currentTrack!]: !l[state.currentTrack!] }))}
          className={`flex-shrink-0 transition-colors ${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          {isLiked ? <HeartFilledIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Center: controls + progress */}
      <div className="flex flex-col items-center gap-1.5 w-[40%] max-w-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            title="Shuffle"
            className={`relative transition-colors ${shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <ShuffleIcon className="w-4 h-4" />
            {shuffle && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
          </button>
          <button onClick={() => playNeighbor(-1)} title="Previous" className="text-[#b3b3b3] hover:text-white transition-colors">
            <PrevIcon className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => playNeighbor(1)} title="Next" className="text-[#b3b3b3] hover:text-white transition-colors">
            <NextIcon className="w-5 h-5" />
          </button>
          <button
            onClick={cycleRepeat}
            title="Repeat"
            className={`relative transition-colors ${repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <RepeatIcon className="w-4 h-4" />
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className={`${repeatMode === 'one' ? 'text-[8px] font-bold' : 'w-1 h-1 rounded-full bg-[#1DB954]'}`}>
                  {repeatMode === 'one' ? '1' : ''}
                </span>
              </span>
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-xs text-[#b3b3b3]">
          <span className="w-10 text-right">{fmt(state.position)}</span>
          <input
            type="range"
            min={0}
            max={Math.floor(state.duration) || 0}
            value={Math.floor(Math.min(state.position, state.duration))}
            onChange={(e) => seekPlayback(Number(e.target.value))}
            className="spotify-range flex-1"
          />
          <span className="w-10">{fmt(state.duration)}</span>
        </div>
      </div>

      {/* Right: utilities */}
      <div className="flex items-center gap-3 w-[30%] justify-end min-w-[180px]">
        <button
          onClick={onToggleNowPlaying}
          title="Now playing view"
          className={`transition-colors ${nowPlayingOpen ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          <NowPlayingIcon className="w-4 h-4" />
        </button>
        <button title="Lyrics" className="text-[#b3b3b3] hover:text-white transition-colors">
          <MicIcon className="w-4 h-4" />
        </button>
        <button title="Queue" className="text-[#b3b3b3] hover:text-white transition-colors">
          <QueueIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            title="Mute"
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            {muted || state.volume === 0 ? <VolumeMuteIcon className="w-4 h-4" /> : <VolumeIcon className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : state.volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
            }}
            className="spotify-range w-20"
          />
        </div>
        <button title="Full screen" className="text-[#b3b3b3] hover:text-white transition-colors">
          <FullscreenIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
