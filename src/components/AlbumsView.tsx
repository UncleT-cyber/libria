import { useLibraryStore, type Track } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { MusicNoteIcon, PlayIcon } from './icons';

export default function AlbumsView() {
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  const albums = tracks.reduce((acc, track) => {
    const key = track.album || 'Unknown Album';
    if (!acc[key]) acc[key] = { title: key, artist: track.artist, first: track, count: 0 };
    acc[key].count++;
    return acc;
  }, {} as Record<string, { title: string; artist: string; first: Track; count: number }>);

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Albums</h1>
      {Object.values(albums).length === 0 ? (
        <p className="text-[#b3b3b3]">Albums you save will show up here.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
          {Object.values(albums).map((album) => (
            <button
              key={album.title}
              onClick={() => playTrack(album.first.id)}
              className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-colors text-left group"
            >
              <div className="relative mb-3">
                <div className="w-full aspect-square bg-[#282828] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#b3b3b3] overflow-hidden">
                  {album.first.artwork_url ? <img src={album.first.artwork_url} alt="" className="w-full h-full object-cover rounded-md" /> : <MusicNoteIcon className="w-12 h-12" />}
                </div>
                <span className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-200">
                  <PlayIcon className="w-6 h-6 ml-0.5" />
                </span>
              </div>
              <div className="text-[16px] font-bold text-white truncate leading-5">{album.title}</div>
              <div className="text-[14px] text-[#a7a7a7] truncate leading-5">{album.artist} • {album.count} songs</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
