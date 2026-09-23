import { useState } from 'react';
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

function TrackArt({ track, size = 'w-12 h-12' }: { track?: Track; size?: string }) {
  if (track?.artwork_url) {
    return <img src={track.artwork_url} alt="" className={`${size} object-cover flex-shrink-0 rounded-sm`} />;
  }
  return (
    <div className={`${size} bg-[#282828] flex items-center justify-center text-[#b3b3b3] flex-shrink-0 rounded-sm`}>
      <MusicNoteIcon className="w-1/2 h-1/2" />
    </div>
  );
}

function QuickTile({ track }: { track: Track }) {
  const { playTrack } = usePlayerStore();
  return (
    <button
      onClick={() => playTrack(track.id)}
      className="flex items-center bg-[#2a2a2a] hover:bg-[#3e3e3e] rounded-md overflow-hidden transition-colors text-left group relative h-16"
    >
      <TrackArt track={track} size="w-16 h-16" />
      <span className="px-4 font-bold text-white text-sm truncate pr-14">{track.title}</span>
      <span className="absolute right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-200">
        <PlayIcon className="w-6 h-6 ml-0.5" />
      </span>
    </button>
  );
}

function Card({ track, subtitle }: { track: Track; subtitle: string }) {
  const { playTrack } = usePlayerStore();
  return (
    <button
      onClick={() => playTrack(track.id)}
      className="w-[160px] sm:w-[180px] flex-shrink-0 bg-[#181818] hover:bg-[#282828] rounded-lg p-3 transition-colors text-left group"
    >
      <div className="relative">
        <div className="w-full aspect-square bg-[#282828] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#b3b3b3] overflow-hidden">
          {track.artwork_url ? <img src={track.artwork_url} alt="" className="w-full h-full object-cover rounded-md" /> : <MusicNoteIcon className="w-12 h-12" />}
        </div>
        <span className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-200">
          <PlayIcon className="w-6 h-6 ml-0.5" />
        </span>
      </div>
      <div className="mt-3 text-[16px] font-bold text-white truncate leading-5">{track.title}</div>
      <div className="text-[14px] text-[#a7a7a7] truncate leading-5">{subtitle}</div>
    </button>
  );
}

export default function HomeView() {
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const topFilters = ['All', 'Music', 'Podcasts', 'Audiobooks'] as const;
  const [activeTop, setActiveTop] = useState<(typeof topFilters)[number]>('All');

  // Filter tracks by top pill (Music = all audio, Podcasts/Audiobooks filtered by title/album hints - placeholder until metadata)
  const filteredByTop = tracks.filter((t) => {
    if (activeTop === 'All') return true;
    if (activeTop === 'Music') return !/podcast|audiobook/i.test(`${t.title} ${t.album}`);
    if (activeTop === 'Podcasts') return /podcast/i.test(`${t.title} ${t.album} ${t.artist}`);
    if (activeTop === 'Audiobooks') return /audiobook|audio book/i.test(`${t.title} ${t.album}`);
    return true;
  });
  const quick = filteredByTop.slice(0, 8);
  const recent = filteredByTop.slice(0, 10);

  const albums = Object.values(
    filteredByTop.reduce((acc, t) => {
      if (t.album && !acc[t.album]) acc[t.album] = t;
      return acc;
    }, {} as Record<string, Track>)
  ).slice(0, 10);

  const artists = Object.values(
    filteredByTop.reduce((acc, track) => {
      if (!acc[track.artist]) acc[track.artist] = { name: track.artist, track };
      return acc;
    }, {} as Record<string, { name: string; track: Track }>),
  ).slice(0, 8);

  return (
    <div className="pb-10">
      <div className="bg-gradient-to-b from-[#2a2a2a] to-[#121212] px-6 pt-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#282828] flex items-center justify-center text-[#b3b3b3] shrink-0 shadow-2xl">
            <svg viewBox="0 0 24 24" className="w-16 h-16" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 4.2-5 8-5s6.5 1.5 8 5" />
            </svg>
          </div>
          <div className="min-w-0 pb-1">
            <div className="text-sm font-medium">Profile</div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight truncate">Libria</h1>
            <p className="mt-4 text-sm text-[#b3b3b3]">Your library</p>
          </div>
        </div>
      </div>

      <div className="px-6">
      <div className="flex gap-2 py-3 sticky top-0 bg-[#121212] z-10">
        {topFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveTop(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium h-8 transition-colors ${activeTop === f ? 'bg-white text-black' : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-white mt-4 mb-1">Top artists this month</h2>
      <p className="text-sm text-[#b3b3b3] mb-4">Only visible to you</p>
      {artists.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {artists.map((artist) => (
            <button key={artist.name} onClick={() => artist.track && playTrack(artist.track.id)} className="w-40 shrink-0 text-left group">
              <div className="w-40 h-40 rounded-full bg-[#282828] overflow-hidden mb-3 flex items-center justify-center text-3xl font-bold text-white">
                {artist.track?.artwork_url ? <img src={artist.track.artwork_url} alt="" className="w-full h-full object-cover" /> : artist.name.slice(0, 1)}
              </div>
              <div className="font-bold truncate">{artist.name}</div>
              <div className="text-sm text-[#b3b3b3]">Artist</div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#b3b3b3] mb-8">Artists from songs in Downloads show up here.</p>
      )}

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
            <span className="text-sm font-bold text-[#1ED760] hover:underline cursor-pointer">Show all</span>
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
            <span className="text-sm font-bold text-[#1ED760] hover:underline cursor-pointer">Show all</span>
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
          <p className="text-[#b3b3b3]">Use + in Your Library to import audio you already have. New files open in Downloads.</p>
        </div>
      )}
      </div>
    </div>
  );
}
