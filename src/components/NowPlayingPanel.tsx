import { usePlayerStore } from '../stores/player';
import { useLibraryStore, type Track } from '../stores/library';
import {
  MusicNoteIcon,
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

  // Video-backed references (YouTube/Vimeo/video hosts) get the dynamic
  // canvas; the video is also surfaced under "Related music videos".
  const rawUrl = track?.id ?? '';
  const embed = videoEmbedUrl(rawUrl);
  const hasVideoPayload = Boolean(rawUrl && (VIDEO_SOURCE_RE.test(rawUrl) || embed));
  const artistTrackCount = track
    ? tracks.filter((t) => t.artist === track.artist).length
    : 0;

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
        <div className="px-4 pb-4 space-y-4">
          {/* High-res media / album art header */}
          {track.artwork_url ? (
            <img
              src={track.artwork_url}
              alt={track.album || track.title}
              className="w-full aspect-square object-cover rounded mb-0"
            />
          ) : hasVideoPayload && embed ? (
            <div className="w-full aspect-video bg-black rounded overflow-hidden">
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
            <div className="w-full aspect-square bg-[#282828] rounded flex items-center justify-center text-[#b3b3b3]">
              <MusicNoteIcon className="w-1/2 h-1/2" />
            </div>
          )}

          <div>
            <div className="text-2xl font-bold text-white mb-1 truncate">{track.title}</div>
            <div className="text-base text-[#b3b3b3] truncate">{track.artist}</div>
            {track.id.startsWith('http') && (
              <div className="flex items-center gap-1.5 text-xs text-[#6a6a6a] truncate mt-1">
                <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{track.id}</span>
              </div>
            )}
          </div>

          {/* About the Artist */}
          <div className="bg-[#242424] rounded-lg overflow-hidden">
            <div className="h-28 bg-[#333333] flex items-end p-4">
              <span className="font-bold text-white">About the Artist</span>
            </div>
            <div className="p-4">
              <div className="text-white font-medium truncate mb-0.5">{track.artist}</div>
              <div className="text-sm text-[#b3b3b3] mb-3">
                {artistTrackCount} {artistTrackCount === 1 ? 'song' : 'songs'} in your library
              </div>
              <button className="px-3 py-1 text-sm font-bold text-white border border-[#6a6a6a] rounded-full hover:border-white transition-colors">
                Follow
              </button>
            </div>
          </div>

          {/* Related music videos — dynamic canvas assets for video-backed imports */}
          {hasVideoPayload && (
            <div className="bg-[#242424] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-white">Related music videos</span>
                <span className="text-sm text-[#b3b3b3] hover:underline cursor-pointer">Show all</span>
              </div>
              <button className="w-full flex items-center gap-3 text-left group">
                <div className="w-24 h-14 bg-black rounded flex items-center justify-center text-[#b3b3b3] flex-shrink-0 relative overflow-hidden">
                  <PlayIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate group-hover:underline">{track.title}</div>
                  <div className="text-xs text-[#b3b3b3]">Official video</div>
                </div>
              </button>
            </div>
          )}

          {/* Song credits */}
          <div className="bg-[#242424] rounded-lg p-4">
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
            {track.id.startsWith('http') && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#3e3e3e] text-xs text-[#b3b3b3]">
                <SpotifyMarkIcon className="w-4 h-4 text-[#1DB954] flex-shrink-0" />
                <span>Imported via Spotify</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
