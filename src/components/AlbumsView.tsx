import { useLibraryStore } from '../stores/library';

export default function AlbumsView() {
  const { tracks } = useLibraryStore();

  // Group tracks by album
  const albums = tracks.reduce((acc, track) => {
    if (!acc[track.album]) {
      acc[track.album] = {
        title: track.album,
        artist: track.artist,
        trackCount: 0,
      };
    }
    acc[track.album].trackCount++;
    return acc;
  }, {} as Record<string, { title: string; artist: string; trackCount: number }>);

  const albumList = Object.values(albums);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-libria-elevated">
        <h1 className="text-2xl font-light">Albums</h1>
        <p className="text-libria-secondary mt-1">{albumList.length} albums</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albumList.map((album, index) => (
            <div
              key={index}
              className="p-4 rounded-lg hover:bg-libria-surface cursor-pointer transition-colors"
            >
              <div className="aspect-square bg-libria-elevated rounded-lg mb-3 flex items-center justify-center">
                <div className="text-libria-secondary text-4xl">💿</div>
              </div>
              <div className="font-medium truncate">{album.title}</div>
              <div className="text-sm text-libria-secondary truncate">
                {album.artist} • {album.trackCount} songs
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}