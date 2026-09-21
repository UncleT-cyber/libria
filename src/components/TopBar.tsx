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
  BrowseIcon,
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

  // Web preview shows mac window dots for pixel parity with reference; Tauri uses native frame (still drag surface)
  const showWindowDots = typeof window !== 'undefined' && !(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

  return (
    <div style={drag} className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-3 h-16 bg-black select-none">
      {/* Left: window dots + navigation chevrons - same top row as Spotify reference */}
      <div className="flex items-center gap-3" style={noDrag}>
        {showWindowDots && (
          <div className="flex items-center gap-2 mr-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
        )}
        <button
          disabled
          title="Go back"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-5 h-5 shrink-0" />
        </button>
        <button
          disabled
          title="Go forward"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-5 h-5 shrink-0" />
        </button>
      </div>

      {/* Center: home pill + search pill (40px height, 9999 radius) */}
      <div className="flex items-center justify-center gap-2 min-w-0" style={noDrag}>
        <button
          onClick={() => onNavigate('home')}
          title="Home"
          className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 transition-colors ${
            currentView === 'home' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          {currentView === 'home' ? <HomeIcon className="w-6 h-6" /> : <HomeOutlineIcon className="w-6 h-6" />}
        </button>
        <div className="relative w-[480px] max-w-[min(480px,40vw)] h-12 flex items-center bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] rounded-full border border-transparent focus-within:border-white transition-colors group">
          <button
            onClick={() => onNavigate('search')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
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
            className="w-full bg-transparent text-white pl-12 pr-[88px] h-full rounded-full text-[16px] font-medium outline-none placeholder-[#b3b3b3] placeholder:font-normal"
          />
          {/* right cluster: divider + browse icon + clear */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query ? (
              <button
                onClick={() => onQueryChange('')}
                title="Clear search"
                className="text-[#b3b3b3] hover:text-white transition-colors p-1"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-px h-6 bg-[#3e3e3e] mx-1" />
            )}
            <button
              onClick={() => onNavigate('search')}
              title="Browse"
              className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
            >
              <BrowseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: bell + friend activity + polished profile circle */}
      <div className="flex items-center justify-end gap-2 relative" style={noDrag}>
        <button
          title="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:scale-105 transition-transform"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        <button
          title="Friend Activity"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:scale-105 transition-transform"
        >
          <FriendsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          title="Profile"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#19e68c] text-black text-sm font-bold ring-2 ring-black hover:scale-105 transition-transform overflow-hidden"
        >
          <span className="w-full h-full flex items-center justify-center bg-[#19e68c] text-black">O</span>
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
