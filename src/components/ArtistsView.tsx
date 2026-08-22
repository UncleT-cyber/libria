import { useLibraryStore } from '../stores/library';

export default function ArtistsView() {
  const { tracks } = useLibraryStore();

  // Group tracks by artist
  const artists = tracks.reduce((acc, track) => {
    if (!acc[track.artist]) {
      acc[track.artist] = {
        name: track.artist,
        albumCount: 0,
        trackCount: 0,
      };
    }
    acc[track.artist].trackCount++;
    return acc;
  }, {} as Record<string, { name: string; albumCount: number; trackCount: number }>);

  const artistList = Object.values(artists);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-libria-elevated">
        <h1 className="text-2xl font-light">Artists</h1>
        <p className="text-libria-secondary mt-1">{artistList.length} artists</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {artistList.map((artist, index) => (
            <div
              key={index}
              className="p-4 rounded-lg hover:bg-libria-surface cursor-pointer transition-colors text-center"
            >
              <div className="aspect-square bg-libria-elevated rounded-full mb-3 flex items-center justify-center mx-auto w-32 h-32">
                <div className="text-libria-secondary text-4xl">🎤</div>
              </div>
              <div className="font-medium truncate">{artist.name}</div>
              <div className="text-sm text-libria-secondary">
                {artist.trackCount} songs
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}