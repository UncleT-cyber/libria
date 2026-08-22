import { usePlayerStore } from '../stores/player';
import { useLibraryStore, type Track } from '../stores/library';
import { MusicNoteIcon, CloudIcon, DownloadIcon } from './icons';

export default function NowPlayingPanel() {
  const { state } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const track: Track | undefined = tracks.find((t) => t.id === state.currentTrack);

  return (
    <aside className="w-80 flex-shrink-0 bg-[#121212] rounded-lg overflow-y-auto">
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-white">
          {track ? (track.album || 'Now playing') : 'Now playing'}
        </h2>
      </div>
      {!track ? (
        <div className="p-4 text-sm text-[#b3b3b3]">Select a song to see what's playing.</div>
      ) : (
        <div className="px-4 pb-4">
          <div className="w-full aspect-square bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] mb-4">
            <MusicNoteIcon className="w-1/2 h-1/2" />
          </div>
          <div className="text-2xl font-bold text-white mb-1 truncate">{track.title}</div>
          <div className="text-base text-[#b3b3b3] truncate mb-4">{track.artist}</div>

          {/* Credits card, like Spotify's credits/about section */}
          <div className="bg-[#242424] rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white">Credits</span>
              <span className="text-sm text-[#b3b3b3]">Show all</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium truncate">{track.artist}</div>
                  <div className="text-xs text-[#b3b3b3]">Main Artist</div>
                </div>
                <button className="px-3 py-1 text-sm font-bold text-white border border-[#6a6a6a] rounded-full hover:border-white transition-colors">
                  Follow
                </button>
              </div>
            </div>
          </div>

          {/* Archival status */}
          <div className="bg-[#242424] rounded-lg p-4 flex items-center gap-3">
            {track.file_path ? (
              <DownloadIcon className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
            ) : (
              <CloudIcon className="w-5 h-5 text-[#b3b3b3] flex-shrink-0" />
            )}
            <div>
              <div className="text-white font-medium text-sm">
                {track.file_path ? 'Archived locally' : 'Streaming'}
              </div>
              <div className="text-xs text-[#b3b3b3]">
                {track.file_path
                  ? 'Playing from your disk — zero buffering'
                  : 'The download queue is archiving this track'}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
