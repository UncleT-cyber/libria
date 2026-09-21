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
  const [notifOpen, setNotifOpen] = useState(false);
  const { tracks } = useLibraryStore();

  // The header doubles as the window drag surface in the desktop shell:
  // `-webkit-app-region: drag` lets the native OS frame (Electron/Tauri)
  // own window controls; interactive children opt back out with `no-drag`.
  const drag = { WebkitAppRegion: 'drag' } as React.CSSProperties;
  const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

  return (
    <div style={drag} className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 h-16 bg-black select-none">
      {/* Left: navigation chevrons - OS window controls are native (Tauri/browser chrome), not hardcoded dots */}
      <div className="flex items-center gap-2" style={noDrag}>
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
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] transition-colors relative"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#3d91f4] rounded-full border border-black" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-80 bg-[#282828] rounded-lg shadow-2xl z-40 overflow-hidden">
                <div className="p-4 border-b border-[#3e3e3e]">
                  <h3 className="font-bold text-white">Notifications</h3>
                  <p className="text-sm text-[#b3b3b3] mt-1">No new notifications</p>
                </div>
                <div className="p-4 text-sm text-[#b3b3b3] text-center py-8">You're all caught up</div>
              </div>
            </>
          )}
        </div>
        <button
          title="Friend Activity"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <FriendsIcon className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="Profile - Anthony Abah"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#19e68c] text-black text-xs font-bold ring-2 ring-black hover:scale-105 hover:brightness-110 transition-all overflow-hidden cursor-pointer"
          >
            <span className="w-full h-full flex items-center justify-center bg-[#19e68c] text-black font-bold">AA</span>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#282828] rounded-md shadow-2xl py-1 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3e3e3e]">
                  <div className="text-sm font-bold text-white">Anthony Abah</div>
                  <div className="text-xs text-[#b3b3b3]">a.abah6082@miva.edu.ng</div>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); window.open('https://github.com/UncleT-cyber', '_blank'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors"
                >
                  Account
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onNavigate('home'); }}
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
    </div>
  );
}
