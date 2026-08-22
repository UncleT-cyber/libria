import { useLibraryStore, type Track } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { MusicNoteIcon, PlayIcon } from './icons';

export default function ArtistsView() {
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  const artists = tracks.reduce((acc, track) => {
    const key = track.artist || 'Unknown Artist';
    if (!acc[key]) acc[key] = { name: key, first: track, count: 0 };
    acc[key].count++;
    return acc;
  }, {} as Record<string, { name: string; first: Track; count: number }>);

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Artists</h1>
      {Object.values(artists).length === 0 ? (
        <p className="text-[#b3b3b3]">Artists you save will show up here.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
          {Object.values(artists).map((artist) => (
            <button
              key={artist.name}
              onClick={() => playTrack(artist.first.id)}
              className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-colors text-left group"
            >
              <div className="relative mb-3">
                <div className="w-full aspect-square bg-[#282828] rounded-full shadow-lg flex items-center justify-center text-[#b3b3b3]">
                  <MusicNoteIcon className="w-1/2 h-1/2" />
                </div>
                <span className="absolute right-2 bottom-2 w-11 h-11 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg transition-all duration-200">
                  <PlayIcon className="w-5 h-5" />
                </span>
              </div>
              <div className="font-bold text-white truncate">{artist.name}</div>
              <div className="text-sm text-[#b3b3b3] truncate">Artist • {artist.count} songs</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
