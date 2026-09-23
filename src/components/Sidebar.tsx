import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import {
  LibraryIcon,
  PlusIcon,
  MusicNoteIcon,
  PlayIcon,
  SearchIcon,
  ExpandArrowIcon,
  ListSortIcon,
  PinIcon,
  DownloadIcon,
} from './icons';

export type ViewName = 'home' | 'search' | 'songs' | 'albums' | 'artists' | 'playlists' | 'downloads';

interface SidebarProps {
  currentView: ViewName;
  collapsed: boolean;
  onViewChange: (view: ViewName) => void;
  onToggleCollapse: () => void;
  onAddMusic: () => void;
}

const CHIPS: { id: ViewName; label: string }[] = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
];

export default function Sidebar({ currentView, collapsed, onViewChange, onToggleCollapse, onAddMusic }: SidebarProps) {
  const { tracks } = useLibraryStore();
  const { state, playTrack } = usePlayerStore();
  const width = collapsed ? 'w-[72px]' : 'w-80';
  const chip = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors leading-none h-8 inline-flex items-center ${
      active ? 'bg-white text-black' : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
    }`;

  return (
    <aside className={`${width} h-full min-h-0 flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-hidden transition-all duration-200`}>
      {/* Header: bookshelf icon + Your Library + Plus + Expand Arrow */}
      <div className={`flex items-center h-14 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Your Library' : 'Collapse Your Library'}
          className={`flex items-center gap-3 text-[16px] font-bold transition-colors ${
            currentView === 'songs' && !collapsed ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <span className="w-6 h-6 flex items-center justify-center"><LibraryIcon className="w-6 h-6" /></span>
          {!collapsed && <span>Your Library</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={onAddMusic}
              title="Add music"
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCollapse}
              title="Expand Your Library"
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <ExpandArrowIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter pills: 16px radius, #282828 bg, 8px 16px padding, active white/black */}
      {!collapsed && (
        <div className="flex gap-2 px-2 pb-3 overflow-x-auto scrollbar-none">
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

      {/* Sub-header: search + Recents sort */}
      {!collapsed && (
        <div className="flex items-center justify-between px-2 py-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323] transition-colors" title="Search in Your Library">
            <SearchIcon className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 text-sm text-[#b3b3b3] hover:text-white transition-colors pr-2" title="Sort">
            <span>Recents</span>
            <ListSortIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Items */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 pb-2">
        <button
          onClick={() => onViewChange('downloads')}
          title={collapsed ? 'Downloads' : undefined}
          className={
            collapsed
              ? 'w-full flex justify-center mb-1 rounded-md hover:bg-[#1a1a1a] p-1 transition-colors'
              : `w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors text-left ${currentView === 'downloads' ? 'bg-[#1a1a1a]' : ''}`
          }
        >
          <div className="w-12 h-12 rounded-[4px] bg-[#1DB954] flex items-center justify-center text-black flex-shrink-0">
            <DownloadIcon className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[14px] leading-5 ${currentView === 'downloads' ? 'text-[#1DB954]' : 'text-white'}`}>Downloads</div>
              <div className="truncate text-[12px] leading-4 text-[#a7a7a7] flex items-center gap-1.5">
                <PinIcon className="w-3 h-3 text-[#1DB954] shrink-0" />
                <span>Folder • {tracks.length} saved</span>
              </div>
            </div>
          )}
        </button>
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
            const isPinned = track.id === tracks[0]?.id && !!track.file_path;
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
                <div className="w-12 h-12 bg-[#282828] rounded-[4px] flex items-center justify-center text-[#b3b3b3] flex-shrink-0 relative overflow-hidden">
                  {track.artwork_url ? (
                    <img src={track.artwork_url} alt="" className="w-full h-full object-cover rounded-[4px]" />
                  ) : (
                    <MusicNoteIcon className="w-5 h-5" />
                  )}
                  {!collapsed && (
                    <div className="absolute inset-0 bg-black/60 rounded-[4px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[14px] leading-5 font-normal ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="truncate text-[12px] leading-4 text-[#a7a7a7] flex items-center gap-1.5">
                      {isPinned && <PinIcon className="w-3 h-3 text-[#1DB954] shrink-0" />}
                      <span>Song • {track.artist}</span>
                    </div>
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
