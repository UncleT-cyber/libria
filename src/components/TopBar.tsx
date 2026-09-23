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
  onToggleListening?: () => void;
  listeningOpen?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

export default function TopBar({ currentView, query, onQueryChange, onNavigate, onOpenSettings, onToggleListening, listeningOpen, onGoBack, onGoForward, canGoBack, canGoForward }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { tracks } = useLibraryStore();

  const drag = { WebkitAppRegion: 'drag' } as React.CSSProperties;
  const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

  return (
    <div style={drag} className="relative sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center bg-black px-4 select-none">
        <div className="flex h-full items-center gap-1" style={noDrag}>
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            title={canGoBack ? 'Go back' : 'No back history'}
            className={`flex h-10 w-10 items-center justify-center text-white ${canGoBack ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-40'}`}
            style={noDrag}
          >
            <ChevronLeftIcon className="h-6 w-6 shrink-0" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            title={canGoForward ? 'Go forward' : 'No forward history'}
            className={`flex h-10 w-10 items-center justify-center text-white ${canGoForward ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-40'}`}
            style={noDrag}
          >
            <ChevronRightIcon className="h-6 w-6 shrink-0" />
          </button>
        </div>

      <div className="flex min-w-0 items-center justify-center gap-2" style={noDrag}>
        <button
          onClick={() => onNavigate('home')}
          title="Home"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition-colors hover:bg-[#333]"
        >
          {currentView === 'home' ? <HomeIcon className="h-6 w-6" /> : <HomeOutlineIcon className="h-6 w-6" />}
        </button>
        <div className="group relative flex h-12 w-[520px] max-w-[min(520px,46vw)] items-center rounded-full bg-[#2a2a2a] transition-colors hover:bg-[#333] focus-within:bg-[#333]">
          <button
            onClick={() => onNavigate('search')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
            title="Search"
          >
            <SearchIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={query}
            onFocus={() => onNavigate('search')}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What do you want to play?"
            className="h-full w-full rounded-full bg-transparent pl-14 pr-16 text-[15px] font-medium text-white outline-none placeholder:font-normal placeholder:text-[#b3b3b3]"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-3">
            {query ? (
              <button
                onClick={() => onQueryChange('')}
                title="Clear search"
                className="text-[#b3b3b3] transition-colors hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-6 w-px bg-[#4d4d4d]" />
            )}
            <button
              onClick={() => onNavigate('search')}
              title="Browse"
              className="flex h-8 w-8 items-center justify-center text-white"
            >
              <BrowseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-end gap-4 pr-1" style={noDrag}>
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className="relative flex h-10 w-10 items-center justify-center text-white hover:text-white"
          >
            <BellIcon className="h-6 w-6" />
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
          onClick={onToggleListening}
          title="Listening activity"
          className={`flex h-10 w-10 items-center justify-center ${listeningOpen ? 'text-white' : 'text-white hover:scale-105'}`}
        >
          <FriendsIcon className="h-6 w-6" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="Profile"
            className="relative flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'conic-gradient(#1ed760 0 80deg, #3a3a3a 80deg 360deg)' }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a2a2a] text-[10px] font-bold text-white">1:5</span>
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
