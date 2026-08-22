import { useState } from 'react';
import { useLibraryStore } from '../stores/library';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  HomeIcon,
  HomeOutlineIcon,
  CloseIcon,
  BellIcon,
  FriendsIcon,
} from './icons';
import type { ViewName } from './Sidebar';

interface TopBarProps {
  currentView: ViewName;
  query: string;
  onQueryChange: (q: string) => void;
  onNavigate: (view: ViewName) => void;
  onOpenSettings: () => void;
}

export default function TopBar({ currentView, query, onQueryChange, onNavigate, onOpenSettings }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { tracks } = useLibraryStore();

  // The header doubles as the window drag surface in the desktop shell:
  // `-webkit-app-region: drag` lets the native OS frame (Electron/Tauri)
  // own window controls; interactive children opt back out with `no-drag`.
  const drag = { WebkitAppRegion: 'drag' } as React.CSSProperties;
  const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

  return (
    <div style={drag} className="sticky top-0 z-30 grid grid-cols-3 items-center px-4 py-2 bg-[#121212]/95 backdrop-blur select-none">
      {/* Left: historical breadcrumb arrows (window controls live on the OS frame) */}
      <div className="flex items-center gap-2" style={noDrag}>
        <button
          disabled
          title="Go back"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-[#b3b3b3] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          disabled
          title="Go forward"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-[#b3b3b3] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Center: home key + unified global search */}
      <div className="flex items-center justify-center gap-2 min-w-0" style={noDrag}>
        <button
          onClick={() => onNavigate('home')}
          title="Home"
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            currentView === 'home' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          {currentView === 'home' ? <HomeIcon className="w-6 h-6" /> : <HomeOutlineIcon className="w-6 h-6" />}
        </button>
        <div className="relative w-full max-w-md">
          <button
            onClick={() => onNavigate('search')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition-colors"
            title="Search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={query}
            onFocus={() => onNavigate('search')}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full bg-[#2a2a2a] hover:bg-[#333333] focus:bg-[#2a2a2a] text-white pl-11 pr-10 py-2.5 rounded-full text-sm outline-none placeholder-[#b3b3b3] border border-transparent focus:ring-1 focus:ring-white transition-colors"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              title="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: notification bell, friend activity, profile avatar + dropdown */}
      <div className="flex items-center justify-end gap-3 relative" style={noDrag}>
        <button
          title="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        <button
          title="Friend Activity"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <FriendsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          title="Profile"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1DB954] text-black text-sm font-bold hover:scale-105 transition-transform"
        >
          L
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-44 bg-[#282828] rounded-md shadow-2xl py-1 z-40">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Account
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Settings
              </button>
              <div className="border-t border-[#3e3e3e] my-1" />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Log out
              </button>
              <div className="px-4 py-2 text-xs text-[#6a6a6a]">{tracks.length} tracks in library</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
