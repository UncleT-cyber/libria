import { useLibraryStore, type Track } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { MusicNoteIcon, PlayIcon } from './icons';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

function TrackArt({ size = 'w-16 h-16' }: { size?: string }) {
  return (
    <div className={`${size} bg-[#282828] flex items-center justify-center text-[#b3b3b3] flex-shrink-0`}>
      <MusicNoteIcon className="w-1/2 h-1/2" />
    </div>
  );
}

function QuickTile({ track }: { track: Track }) {
  const { playTrack } = usePlayerStore();
  return (
    <button
      onClick={() => playTrack(track.id)}
      className="flex items-center bg-[#2a2a2a] hover:bg-[#404040] rounded overflow-hidden transition-colors text-left group relative"
    >
      <TrackArt />
      <span className="px-4 font-bold text-white truncate">{track.title}</span>
      <span className="absolute right-3 w-11 h-11 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-lg transition-opacity">
        <PlayIcon className="w-5 h-5" />
      </span>
    </button>
  );
}

function Card({ track, subtitle }: { track: Track; subtitle: string }) {
  const { playTrack } = usePlayerStore();
  return (
    <button
      onClick={() => playTrack(track.id)}
      className="w-44 flex-shrink-0 bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-colors text-left group"
    >
      <div className="relative">
        <div className="w-full aspect-square bg-[#282828] rounded-md shadow-lg flex items-center justify-center text-[#b3b3b3]">
          <MusicNoteIcon className="w-1/2 h-1/2" />
        </div>
        <span className="absolute right-2 bottom-2 w-11 h-11 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg transition-all duration-200">
          <PlayIcon className="w-5 h-5" />
        </span>
      </div>
      <div className="mt-3 font-bold text-white truncate">{track.title}</div>
      <div className="text-sm text-[#b3b3b3] truncate">{subtitle}</div>
    </button>
  );
}

export default function HomeView() {
  const { tracks } = useLibraryStore();
  const quick = tracks.slice(0, 8);
  const recent = tracks.slice(0, 10);

  const albums = Object.values(
    tracks.reduce((acc, t) => {
      if (t.album && !acc[t.album]) acc[t.album] = t;
      return acc;
    }, {} as Record<string, Track>)
  ).slice(0, 10);

  return (
    <div className="px-6 pb-10">
      <h1 className="text-3xl font-bold text-white mb-4 mt-2">{greeting()}</h1>

      {quick.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-10">
          {quick.map((t) => (
            <QuickTile key={t.id} track={t} />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Recently added</h2>
            <span className="text-sm font-bold text-[#b3b3b3] hover:underline cursor-pointer">Show all</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recent.map((t) => (
              <Card key={t.id} track={t} subtitle={t.artist} />
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Your albums</h2>
            <span className="text-sm font-bold text-[#b3b3b3] hover:underline cursor-pointer">Show all</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {albums.map((t) => (
              <Card key={t.album} track={t} subtitle={t.album} />
            ))}
          </div>
        </section>
      )}

      {tracks.length === 0 && (
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Your library is empty</h2>
          <p className="text-[#b3b3b3]">Hit the + in Your Library to scan folders, import files, or pull a Spotify URL.</p>
        </div>
      )}
    </div>
  );
}
