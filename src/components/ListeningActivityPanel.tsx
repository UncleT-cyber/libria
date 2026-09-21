import { CloseIcon } from './icons';

interface Props {
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function ListeningActivityPanel({ onClose, onOpenSettings }: Props) {
  return (
    <aside className="w-[350px] flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-y-auto min-h-0">
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-white text-[16px]">Listening activity</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323] transition-colors"
          title="Close"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 pb-4 space-y-6">
        <p className="text-sm text-[#b3b3b3] leading-5">
          Let friends and followers on Spotify see what you're listening to.
        </p>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#232323] flex items-center justify-center text-[#6a6a6a]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                {i < 2 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#3d91f4] rounded-full border-2 border-[#121212]" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#2a2a2a] rounded w-3/4" />
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
                <div className="h-3 bg-[#2a2a2a] rounded w-2/3 opacity-60" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#b3b3b3] leading-5">
          Go to Settings &gt; Listening activity and insights, and turn on Listening activity. You can turn this off at any time.
        </p>
        <button
          onClick={onOpenSettings}
          className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
        >
          Settings
        </button>
      </div>
    </aside>
  );
}
