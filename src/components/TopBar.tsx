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
  const isTauriWindow = typeof window !== 'undefined' && !!(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

  return (
    <div style={drag} className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 h-[68px] bg-black select-none">
        {/* Left: traffic lights at (12,26) + chevrons - tips centered on traffic light middle (~y 32), gap 76px avoids overlap, slightly larger */}
        <div className={`flex items-center gap-2.5 ${isTauriWindow ? 'pl-[76px]' : ''}`} style={{...noDrag, position: 'relative', top: isTauriWindow ? '-8px' : '0px'}}>
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            title={canGoBack ? 'Go back' : 'No back history'}
            className={`w-9 h-9 flex items-center justify-center rounded-full bg-black text-white shrink-0 ${canGoBack ? 'hover:bg-[#1a1a1a] cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            style={noDrag}
          >
            <ChevronLeftIcon className="w-[22px] h-[22px] shrink-0" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            title={canGoForward ? 'Go forward' : 'No forward history'}
            className={`w-9 h-9 flex items-center justify-center rounded-full bg-black text-white shrink-0 ${canGoForward ? 'hover:bg-[#1a1a1a] cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            style={noDrag}
          >
            <ChevronRightIcon className="w-[22px] h-[22px] shrink-0" />
          </button>
        </div>

      {/* Center: home pill + search pill - ~8% larger */}
      <div className="flex items-center justify-center gap-2.5 min-w-0" style={noDrag}>
        <button
          onClick={() => onNavigate('home')}
          title="Home"
          className={`w-[52px] h-[52px] flex items-center justify-center rounded-full shrink-0 transition-colors ${
            currentView === 'home' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          {currentView === 'home' ? <HomeIcon className="w-[26px] h-[26px]" /> : <HomeOutlineIcon className="w-[26px] h-[26px]" />}
        </button>
        <div className="relative w-[500px] max-w-[min(500px,40vw)] h-[52px] flex items-center bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] rounded-full border border-transparent focus-within:border-white transition-colors group">
          <button
            onClick={() => onNavigate('search')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white"
            title="Search"
          >
            <SearchIcon className="w-[22px] h-[22px]" />
          </button>
          <input
            type="text"
            value={query}
            onFocus={() => onNavigate('search')}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full bg-transparent text-white pl-[46px] pr-[90px] h-full rounded-full text-[17px] font-medium outline-none placeholder-[#b3b3b3] placeholder:font-normal"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query ? (
              <button
                onClick={() => onQueryChange('')}
                title="Clear search"
                className="text-[#b3b3b3] hover:text-white transition-colors p-1"
              >
                <CloseIcon className="w-[22px] h-[22px]" />
              </button>
            ) : (
              <div className="w-px h-6 bg-[#3e3e3e] mx-1" />
            )}
            <button
              onClick={() => onNavigate('search')}
              title="Browse"
              className="w-9 h-9 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
            >
              <BrowseIcon className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: bell + listening activity + profile - ~8% larger */}
      <div className="flex items-center justify-end gap-2.5 relative" style={noDrag}>
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] transition-colors relative"
          >
            <BellIcon className="w-[22px] h-[22px]" />
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
          onClick={onToggleListening}
          title="Listening activity"
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${listeningOpen ? 'bg-white text-black' : 'bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]'}`}
        >
          <FriendsIcon className="w-[22px] h-[22px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="Profile - Anthony Abah"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#19e68c] text-black text-sm font-bold ring-2 ring-black hover:scale-105 hover:brightness-110 transition-all overflow-hidden cursor-pointer"
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
