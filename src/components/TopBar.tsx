import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, GearIcon } from './icons';
import type { ViewName } from './Sidebar';

interface TopBarProps {
  currentView: ViewName;
  query: string;
  onQueryChange: (q: string) => void;
  onOpenSettings: () => void;
}

export default function TopBar({ currentView, query, onQueryChange, onOpenSettings }: TopBarProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#121212]/90 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-[#b3b3b3] cursor-not-allowed opacity-60"
          title="Go back"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-[#b3b3b3] cursor-not-allowed opacity-40"
          title="Go forward"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        {currentView === 'search' && (
          <div className="ml-2 relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a6a]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="What do you want to play?"
              className="w-96 bg-[#242424] text-white pl-10 pr-4 py-2 rounded-full text-sm outline-none placeholder-[#6a6a6a] border border-transparent hover:border-[#4d4d4d] focus:border-white transition-colors"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          title="Settings"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:scale-105 transition-all"
        >
          <GearIcon className="w-5 h-5" />
        </button>
        <button
          title="Profile"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1DB954] text-black text-sm font-bold hover:scale-105 transition-transform"
        >
          L
        </button>
      </div>
    </div>
  );
}
