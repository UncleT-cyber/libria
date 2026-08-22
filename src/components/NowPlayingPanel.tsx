import { usePlayerStore } from '../stores/player';
import { useLibraryStore, type Track } from '../stores/library';
import {
  MusicNoteIcon,
  CloudIcon,
  DownloadIcon,
  SpotifyMarkIcon,
  LinkIcon,
  PlayIcon,
} from './icons';

const VIDEO_SOURCE_RE = /youtube|youtu\.be|vimeo|dailymotion|twitch|video/i;

function videoEmbedUrl(src: string): string | null {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=0&rel=0`;
  const vimeo = src.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function NowPlayingPanel() {
  const { state } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const track: Track | undefined = tracks.find((t) => t.id === state.currentTrack);

  // Video payload surface: when an imported reference carries a video-backed
  // source the right panel becomes the dynamic video presentation canvas.
  const rawUrl = track?.id ?? '';
  const embed = videoEmbedUrl(rawUrl);
  const hasVideoPayload = Boolean(rawUrl && (VIDEO_SOURCE_RE.test(rawUrl) || embed));

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-y-auto min-h-0">
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-white">
          {track ? (track.album || 'Now playing') : 'Now playing'}
        </h2>
      </div>

      {!track ? (
        <div className="p-4 text-sm text-[#b3b3b3]">Select a song to see what's playing.</div>
      ) : (
        <div className="px-4 pb-4">
          {/* Dynamic video canvas OR static art snapshot */}
          {hasVideoPayload && embed ? (
            <div className="w-full aspect-video bg-black rounded mb-4 overflow-hidden">
              <iframe
                key={embed}
                src={embed}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={track.title}
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3] mb-4">
              {hasVideoPayload ? (
                <div className="text-center px-4">
                  <PlayIcon className="w-1/2 h-1/2 mx-auto mb-2 opacity-60" />
                  <span className="text-xs text-[#6a6a6a]">Video stream pending</span>
                </div>
              ) : (
                <MusicNoteIcon className="w-1/2 h-1/2" />
              )}
            </div>
          )}

          <div className="text-2xl font-bold text-white mb-1 truncate">{track.title}</div>
          <div className="text-base text-[#b3b3b3] truncate mb-1">{track.artist}</div>
          {track.id.startsWith('http') && (
            <div className="flex items-center gap-1.5 text-xs text-[#6a6a6a] truncate mb-4">
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{track.id}</span>
            </div>
          )}

          <div className="bg-[#242424] rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white">Credits</span>
              <span className="text-sm text-[#b3b3b3] hover:underline cursor-pointer">Show all</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-white font-medium truncate">{track.artist}</div>
                <div className="text-xs text-[#b3b3b3]">Main Artist</div>
              </div>
              <button className="px-3 py-1 text-sm font-bold text-white border border-[#6a6a6a] rounded-full hover:border-white transition-colors">
                Follow
              </button>
            </div>
          </div>

          <div className="bg-[#242424] rounded-lg p-4 flex items-center gap-3">
            {track.file_path ? (
              <DownloadIcon className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
            ) : track.id.startsWith('http') ? (
              <SpotifyMarkIcon className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
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
