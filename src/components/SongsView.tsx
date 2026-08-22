import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLibraryStore, type Track } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { PlayIcon, PauseIcon, MusicNoteIcon, ClockIcon, CloudIcon, DownloadIcon, MoreIcon, ShuffleIcon } from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '–';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function EqBars() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      <div className="eq-bar" />
      <div className="eq-bar" style={{ animationDelay: '0.33s' }} />
      <div className="eq-bar" style={{ animationDelay: '0.66s' }} />
    </div>
  );
}

export function TrackTable({ rows, onAddMusic }: { rows: Track[]; onAddMusic?: () => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { state, playTrack, pausePlayback } = usePlayerStore();
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
  });

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-2xl font-bold text-white">Songs you add will appear here</h2>
        <p className="text-[#b3b3b3]">Scan a folder, import files, or paste a Spotify URL.</p>
        {onAddMusic && (
          <button
            onClick={onAddMusic}
            className="mt-2 px-6 py-2.5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Add music
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      {/* Header row */}
      <div className="sticky top-0 z-10 bg-[#121212] border-b border-[#2a2a2a] px-4 py-2 grid grid-cols-[16px_1fr_200px_minmax(120px,1fr)_40px] gap-4 text-sm text-[#b3b3b3] font-medium">
        <span className="text-right">#</span>
        <span>Title</span>
        <span className="hidden sm:block"></span>
        <span>Album</span>
        <span className="flex justify-end pr-2">
          <ClockIcon className="w-4 h-4" />
        </span>
      </div>

      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((row) => {
          const track = rows[row.index];
          const isCurrent = state.currentTrack === track.id;
          const playing = isCurrent && state.isPlaying;
          return (
            <div
              key={track.id}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}
              onClick={() => (playing ? pausePlayback() : playTrack(track.id))}
              className="group grid grid-cols-[16px_1fr_200px_minmax(120px,1fr)_40px] gap-4 items-center px-4 rounded-md hover:bg-[#2a2a2a] cursor-pointer"
            >
              {/* # / playing indicator */}
              <div className="text-sm text-[#b3b3b3] flex justify-end">
                {playing ? (
                  <>
                    <span className="group-hover:hidden"><EqBars /></span>
                    <span className="hidden group-hover:block"><PauseIcon className="w-3.5 h-3.5 text-white" /></span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:hidden">{row.index + 1}</span>
                    <span className="hidden group-hover:block"><PlayIcon className="w-3.5 h-3.5 text-white" /></span>
                  </>
                )}
              </div>

              {/* Title + art + artist */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0">
                  <MusicNoteIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className={`truncate font-medium ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                    {track.title}
                  </div>
                  <div className="truncate text-sm text-[#b3b3b3]">{track.artist}</div>
                </div>
              </div>

              {/* archive status */}
              <div className="hidden sm:flex items-center text-[#b3b3b3]" title={track.file_path ? 'Archived locally' : 'Streaming, not yet archived'}>
                {track.file_path ? (
                  <DownloadIcon className="w-4 h-4 text-[#1DB954]" />
                ) : (
                  <CloudIcon className="w-4 h-4" />
                )}
              </div>

              <span className="truncate text-sm text-[#b3b3b3]">{track.album || '—'}</span>

              <span className="text-sm text-[#b3b3b3] text-right pr-2 flex items-center justify-end gap-3">
                <MoreIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                {fmt(track.duration)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SongsView({ onAddMusic, query = '' }: { onAddMusic?: () => void; query?: string }) {
  const { tracks } = useLibraryStore();
  const { state, playTrack, shuffle, toggleShuffle } = usePlayerStore();
  const filtered = query
    ? tracks.filter((t) =>
        `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query.toLowerCase())
      )
    : tracks;

  const totalSec = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.round((totalSec % 3600) / 60);
  const durationLabel = hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;

  return (
    <div className="h-full flex flex-col">
      {/* Gradient hero */}
      <div className="bg-gradient-to-b from-[#13552c] via-[#0f3d21]/80 to-transparent px-6 pt-14 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 max-w-[232px] bg-[#282828] rounded-md shadow-[0_4px_60px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#b3b3b3] flex-shrink-0">
            <MusicNoteIcon className="w-24 h-24" />
          </div>
          <div className="min-w-0 pb-2">
            <div className="text-sm font-bold text-white mb-2">Playlist</div>
            <h1 className="text-6xl font-black text-white mb-4 truncate">
              {query ? 'Results' : 'Your Library'}
            </h1>
            <div className="text-sm text-[#b3b3b3]">
              <span className="text-white font-bold">Libria</span>
              <span className="mx-1">•</span>
              {query ? `${filtered.length} of ${tracks.length} songs` : `${tracks.length} songs`}
              {totalSec > 0 && (
                <>
                  <span className="mx-1">•</span>
                  {durationLabel}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 flex items-center gap-6 bg-gradient-to-b from-[#0f3d21]/40 to-transparent">
        <button
          onClick={() => filtered[0] && (state.isPlaying ? undefined : playTrack(filtered[0].id))}
          className="w-14 h-14 bg-[#1DB954] text-black rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-all shadow-lg"
        >
          {state.isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleShuffle}
          className={`relative transition-colors ${shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          title="Enable shuffle"
        >
          <ShuffleIcon className="w-8 h-8" />
          {shuffle && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
        </button>
      </div>

      <TrackTable rows={filtered} onAddMusic={onAddMusic} />
    </div>
  );
}
