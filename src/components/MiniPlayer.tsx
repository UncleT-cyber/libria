import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { CloseIcon, MusicNoteIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function MiniPlayer({ onClose }: { onClose: () => void }) {
  const { state, playTrack, pausePlayback, seekPlayback } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const track = tracks.find((t) => t.id === state.currentTrack);
  const playable = tracks.filter((t) => !!t.file_path);
  const progress = state.duration > 0 ? Math.min(100, (state.position / state.duration) * 100) : 0;

  const playNeighbor = (dir: 1 | -1) => {
    if (playable.length === 0) return;
    const index = playable.findIndex((t) => t.id === state.currentTrack);
    const next = index === -1 ? 0 : (index + dir + playable.length) % playable.length;
    playTrack(playable[next].id);
  };

  const togglePlay = () => {
    if (state.isPlaying) pausePlayback();
    else if (state.currentTrack) playTrack(state.currentTrack);
  };

  return (
    <div className="fixed bottom-[84px] right-3 z-[80] w-[340px] overflow-hidden rounded-lg border border-[#3e3e3e] bg-[#121212] shadow-2xl">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#282828] text-[#b3b3b3]">
          {track?.artwork_url ? (
            <img src={track.artwork_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <MusicNoteIcon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-white">{track?.title ?? 'Nothing playing'}</div>
          <div className="truncate text-xs text-[#b3b3b3]">{track?.artist ?? 'Pick a song in your library'}</div>
        </div>
        <button onClick={() => playNeighbor(-1)} title="Previous" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <PrevIcon className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlay}
          title={state.isPlaying ? 'Pause' : 'Play'}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
        >
          {state.isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
        </button>
        <button onClick={() => playNeighbor(1)} title="Next" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <NextIcon className="h-4 w-4" />
        </button>
        <button onClick={onClose} title="Close mini player" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        title="Seek"
        className="relative block h-1 w-full bg-[#4d4d4d]"
        onClick={(event) => {
          if (!state.duration) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          seekPlayback(ratio * state.duration);
        }}
      >
        <span className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress}%` }} />
      </button>
      <div className="flex justify-between px-3 py-1 text-[10px] text-[#a7a7a7]">
        <span>{fmt(state.position)}</span>
        <span>{fmt(state.duration)}</span>
      </div>
    </div>
  );
}
