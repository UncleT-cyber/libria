import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import {
  HomeIcon,
  HomeOutlineIcon,
  SearchIcon,
  LibraryIcon,
  PlusIcon,
  MusicNoteIcon,
  PlayIcon,
} from './icons';

export type ViewName = 'home' | 'search' | 'songs' | 'albums' | 'artists' | 'playlists';

interface SidebarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
  onAddMusic: () => void;
}

const CHIPS: { id: ViewName; label: string }[] = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
];

export default function Sidebar({ currentView, onViewChange, onAddMusic }: SidebarProps) {
  const { tracks } = useLibraryStore();
  const { state, playTrack } = usePlayerStore();

  const navButton = (active: boolean) =>
    `w-full flex items-center gap-5 px-3 py-2 text-base font-bold transition-colors ${
      active ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
    }`;

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-white text-black'
        : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
    }`;

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-2 min-h-0">
      {/* Top panel: Home / Search */}
      <div className="bg-[#121212] rounded-lg py-2 px-3">
        <button className={navButton(currentView === 'home')} onClick={() => onViewChange('home')}>
          {currentView === 'home' ? <HomeIcon /> : <HomeOutlineIcon />}
          Home
        </button>
        <button className={navButton(currentView === 'search')} onClick={() => onViewChange('search')}>
          <SearchIcon />
          Search
        </button>
      </div>

      {/* Bottom panel: Your Library */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button
            onClick={() => onViewChange('songs')}
            className={`flex items-center gap-3 text-base font-bold transition-colors ${
              currentView === 'songs' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <LibraryIcon />
            Your Library
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddMusic}
              title="Add music"
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          <button className={chip(currentView === 'songs')} onClick={() => onViewChange('songs')}>
            All
          </button>
          {CHIPS.map((c) => (
            <button key={c.id} className={chip(currentView === c.id)} onClick={() => onViewChange(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Library items */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {tracks.length === 0 ? (
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
          ) : (
            tracks.map((track) => {
              const isCurrent = state.currentTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => playTrack(track.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 relative">
                    <MusicNoteIcon className="w-5 h-5" />
                    <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className={`truncate font-medium ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="truncate text-sm text-[#b3b3b3]">
                      Song • {track.artist}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
