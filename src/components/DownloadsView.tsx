import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { DownloadIcon, MusicNoteIcon, PlayIcon } from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function DownloadsView({ onAddMusic }: { onAddMusic: () => void }) {
  const { tracks, isLoading } = useLibraryStore();
  const { state, playTrack } = usePlayerStore();

  return (
    <div className="px-6 pb-10">
      <div className="bg-gradient-to-b from-[#1a3a28] to-[#121212] -mx-6 px-6 pt-8 pb-6 flex items-end gap-6">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-md bg-[#1DB954] flex items-center justify-center text-black shadow-2xl shrink-0">
          <DownloadIcon className="w-16 h-16" />
        </div>
        <div className="min-w-0 pb-1">
          <div className="text-sm font-medium text-white">Folder</div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">Downloads</h1>
          <p className="mt-3 text-sm text-[#b3b3b3]">{tracks.length} saved · new songs land here first</p>
        </div>
      </div>

      {isLoading && (
        <div className="my-4 flex items-center gap-3 text-sm text-white">
          <span className="h-4 w-4 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />
          Adding to Downloads…
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white mb-2">Nothing saved yet</h2>
          <p className="text-[#b3b3b3] mb-4">Import audio you already have. It shows up in this folder.</p>
          <button onClick={onAddMusic} className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold">
            Add music
          </button>
        </div>
      ) : (
        <div className="mt-4">
          {tracks.map((track, index) => {
            const current = state.currentTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => playTrack(track.id)}
                className="w-full grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1a1a1a] text-left"
              >
                <span className="text-sm text-[#b3b3b3] tabular-nums">{current ? <PlayIcon className="w-4 h-4 text-[#1DB954]" /> : index + 1}</span>
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0 overflow-hidden">
                    {track.artwork_url ? <img src={track.artwork_url} alt="" className="w-full h-full object-cover" /> : <MusicNoteIcon className="w-4 h-4 text-[#b3b3b3]" />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm ${current ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</span>
                    <span className="block truncate text-xs text-[#b3b3b3]">{track.artist}</span>
                  </span>
                </span>
                <span className="text-sm text-[#b3b3b3] tabular-nums">{fmt(track.duration)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
