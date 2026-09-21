import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { CloseIcon, ExpandArrowIcon } from './icons';

interface Props {
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function LyricsPanel({ onClose, expanded, onToggleExpand }: Props) {
  const { tracks } = useLibraryStore();
  const { state } = usePlayerStore();
  const track = tracks.find((t) => t.id === state.currentTrack);

  return (
    <aside className={`${expanded ? 'w-[420px]' : 'w-[350px]'} flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-hidden transition-all duration-200`}>
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-white text-[16px]">Lyrics</h2>
        <div className="flex items-center gap-1">
          <button onClick={onToggleExpand} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]" title={expanded ? 'Collapse' : 'Expand'}>
            <ExpandArrowIcon className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {!track ? (
          <p className="text-sm text-[#b3b3b3]">Play a track to see lyrics.</p>
        ) : (track as unknown as { lyrics?: string }).lyrics ? (
          <pre className="whitespace-pre-wrap text-sm text-white leading-6 font-sans">{(track as unknown as { lyrics?: string }).lyrics}</pre>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#b3b3b3]">No lyrics available for <span className="text-white font-medium">{track.title}</span>.</p>
            <div className="bg-[#242424] rounded-lg p-4">
              <p className="text-sm text-white font-bold mb-1">About lyrics</p>
              <p className="text-xs text-[#b3b3b3]">Lyrics are provided by Musixmatch. Import a track with embedded USLT or LRC.</p>
            </div>
            {track.artwork_url && <img src={track.artwork_url} alt="" className="w-full aspect-square object-cover rounded-lg opacity-60" />}
          </div>
        )}
      </div>
    </aside>
  );
}
