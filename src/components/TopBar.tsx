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
    <div style={drag} className="sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 bg-black pr-3 select-none">
        <div className="flex h-full items-center gap-1" style={{ ...noDrag, paddingLeft: 76 }}>
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            title={canGoBack ? 'Go back' : 'No back history'}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${canGoBack ? 'cursor-pointer hover:bg-[#1a1a1a]' : 'cursor-not-allowed opacity-40'}`}
            style={noDrag}
          >
            <ChevronLeftIcon className="h-4 w-4 shrink-0" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            title={canGoForward ? 'Go forward' : 'No forward history'}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${canGoForward ? 'cursor-pointer hover:bg-[#1a1a1a]' : 'cursor-not-allowed opacity-40'}`}
            style={noDrag}
          >
            <ChevronRightIcon className="h-4 w-4 shrink-0" />
          </button>
        </div>

      <div className="flex min-w-0 items-center justify-center gap-2" style={noDrag}>
        <button
          onClick={() => onNavigate('home')}
          title="Home"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            currentView === 'home' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          {currentView === 'home' ? <HomeIcon className="h-[18px] w-[18px]" /> : <HomeOutlineIcon className="h-[18px] w-[18px]" />}
        </button>
        <div className="group relative flex h-10 w-[420px] max-w-[min(420px,38vw)] items-center rounded-full border border-transparent bg-[#242424] transition-colors hover:bg-[#2a2a2a] focus-within:border-white focus-within:bg-[#2a2a2a]">
          <button
            onClick={() => onNavigate('search')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
            title="Search"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </button>
          <input
            type="text"
            value={query}
            onFocus={() => onNavigate('search')}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What do you want to play?"
            className="h-full w-full rounded-full bg-transparent pl-10 pr-16 text-[15px] font-medium text-white outline-none placeholder:font-normal placeholder:text-[#b3b3b3]"
          />
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {query ? (
              <button
                onClick={() => onQueryChange('')}
                title="Clear search"
                className="p-1 text-[#b3b3b3] transition-colors hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="mx-1 h-4 w-px bg-[#3e3e3e]" />
            )}
            <button
              onClick={() => onNavigate('search')}
              title="Browse"
              className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] transition-colors hover:text-white"
            >
              <BrowseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-end gap-2" style={noDrag}>
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a]"
          >
            <BellIcon className="h-[18px] w-[18px]" />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-black bg-[#3d91f4]" />
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
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${listeningOpen ? 'bg-white text-black' : 'bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]'}`}
        >
          <FriendsIcon className="h-[18px] w-[18px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="Profile - Anthony Abah"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#19e68c] text-[11px] font-bold text-black ring-2 ring-black transition-all hover:brightness-110 cursor-pointer"
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
