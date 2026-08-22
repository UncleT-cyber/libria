import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import {
  LibraryIcon,
  PlusIcon,
  MusicNoteIcon,
  PlayIcon,
} from './icons';

export type ViewName = 'home' | 'search' | 'songs' | 'albums' | 'artists' | 'playlists';

interface SidebarProps {
  currentView: ViewName;
  collapsed: boolean;
  onViewChange: (view: ViewName) => void;
  onToggleCollapse: () => void;
  onAddMusic: () => void;
}

const CHIPS: { id: ViewName; label: string }[] = [
  { id: 'songs', label: 'All' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
];

export default function Sidebar({ currentView, collapsed, onViewChange, onToggleCollapse, onAddMusic }: SidebarProps) {
  const { tracks } = useLibraryStore();
  const { state, playTrack } = usePlayerStore();
  const width = collapsed ? 'w-[72px]' : 'w-80';
  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active ? 'bg-white text-black' : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
    }`;

  return (
    <aside className={`${width} flex-shrink-0 flex flex-col bg-[#121212] rounded-lg transition-all duration-200 min-h-0`}>
      {/* Header: clicking the Library icon or label toggles collapse */}
      <div className={`flex items-center pt-3 pb-2 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Your Library' : 'Collapse Your Library'}
          className={`flex items-center gap-3 text-base font-bold transition-colors ${
            currentView === 'songs' && !collapsed ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <LibraryIcon />
          {!collapsed && <span>Your Library</span>}
        </button>
        {!collapsed && (
          <button
            onClick={onAddMusic}
            title="Add music"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter chips (expanded only) */}
      {!collapsed && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          {CHIPS.map((c) => (
            <button key={c.id} className={chip(currentView === c.id)} onClick={() => onViewChange(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      )}
      {collapsed && (
        <button
          onClick={onAddMusic}
          title="Add music"
          className="mx-2 mb-2 h-10 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {tracks.length === 0 ? (
          !collapsed ? (
            <div className="m-2 p-4 bg-[#242424] rounded-lg">
              <div className="font-bold text-white mb-1">Add your first track</div>
              <p className="text-sm text-[#b3b3b3] mb-4">It's easy, we'll help you.</p>
              <button
                onClick={onAddMusic}
                className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
              >
                Add music
              </button>
            </div>
          ) : null
        ) : (
          tracks.map((track) => {
            const isCurrent = state.currentTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => playTrack(track.id)}
                title={collapsed ? `${track.title} • ${track.artist}` : undefined}
                className={
                  collapsed
                    ? 'w-full flex justify-center mb-1 rounded-md hover:bg-[#1a1a1a] p-1 transition-colors'
                    : 'w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors text-left group'
                }
              >
                <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 relative">
                  <MusicNoteIcon className="w-5 h-5" />
                  {!collapsed && (
                    <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <div className={`truncate font-medium ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="truncate text-sm text-[#b3b3b3]">Song • {track.artist}</div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
