import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { CloseIcon, ExpandArrowIcon, PlayIcon, MusicNoteIcon } from './icons';

interface Props {
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function QueuePanel({ onClose, expanded, onToggleExpand }: Props) {
  const { tracks } = useLibraryStore();
  const { state, history, playTrack } = usePlayerStore();
  const currentIdx = tracks.findIndex((t) => t.id === state.currentTrack);
  const nextUp = currentIdx >= 0 ? tracks.slice(currentIdx + 1, currentIdx + 6) : tracks.slice(0, 5);
  const queue = tracks.filter((_, i) => i !== currentIdx).slice(0, 10);
  const recentlyPlayed = history
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean) as typeof tracks;

  return (
    <aside className={`${expanded ? 'w-[420px]' : 'w-[350px]'} flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-hidden transition-all duration-200`}>
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-white text-[16px]">Queue</h2>
        <div className="flex items-center gap-1">
          <button onClick={onToggleExpand} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]" title={expanded ? 'Collapse' : 'Expand'}>
            <ExpandArrowIcon className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {state.currentTrack && (
          <div className="px-2">
            <h3 className="text-sm font-bold text-white mb-2">Now playing</h3>
            {tracks.filter((t) => t.id === state.currentTrack).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 bg-[#232323] rounded-md">
                <img src={t.artwork_url || ''} alt="" className="w-12 h-12 bg-[#282828] rounded object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-[#1DB954] truncate">{t.title}</div>
                  <div className="text-xs text-[#b3b3b3] truncate">{t.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-2">
          <h3 className="text-sm font-bold text-white mb-2">Next up</h3>
          {nextUp.length === 0 ? (
            <p className="text-sm text-[#b3b3b3] px-2">No upcoming tracks. Add more to library.</p>
          ) : (
            nextUp.map((t) => (
              <button key={t.id} onClick={() => playTrack(t.id)} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md text-left group">
                <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 overflow-hidden">
                  {t.artwork_url ? <img src={t.artwork_url} alt="" className="w-full h-full object-cover" /> : <MusicNoteIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate group-hover:text-[#1DB954]">{t.title}</div>
                  <div className="text-xs text-[#b3b3b3] truncate">{t.artist}</div>
                </div>
                <PlayIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
              </button>
            ))
          )}
        </div>
        <div className="px-2">
          <h3 className="text-sm font-bold text-white mb-2">Recently played</h3>
          {recentlyPlayed.length === 0 ? (
            <p className="text-sm text-[#6a6a6a] px-2">No recently played tracks yet.</p>
          ) : (
            recentlyPlayed.slice(0, 5).map((t) => (
              <button key={t.id} onClick={() => playTrack(t.id)} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md text-left group">
                <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 overflow-hidden">
                  {t.artwork_url ? <img src={t.artwork_url} alt="" className="w-full h-full object-cover" /> : <MusicNoteIcon className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate group-hover:text-[#1DB954]">{t.title}</div>
                  <div className="text-xs text-[#b3b3b3] truncate">{t.artist}</div>
                </div>
                <PlayIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
              </button>
            ))
          )}
        </div>
        <div className="px-2">
          <h3 className="text-sm font-bold text-white mb-2">Queue ({queue.length})</h3>
          {queue.slice(0, 5).map((t) => (
            <button key={t.id} onClick={() => playTrack(t.id)} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md text-left">
              <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0">
                <MusicNoteIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{t.title}</div>
                <div className="text-xs text-[#b3b3b3] truncate">{t.artist}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
