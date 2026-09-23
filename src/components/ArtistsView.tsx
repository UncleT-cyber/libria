import { useEffect, useRef, useState } from 'react';
import { useLibraryStore, type Track } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useVisuals } from '../lib/visuals';
import { MusicNoteIcon, PlayIcon } from './icons';

export default function ArtistsView() {
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { items, load, addClip } = useVisuals();
  const [artistName, setArtistName] = useState<string | null>(null);
  const [clip, setClip] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const artists = tracks.reduce((acc, track) => {
    const key = track.artist || 'Unknown Artist';
    if (!acc[key]) acc[key] = { name: key, first: track, count: 0 };
    acc[key].count++;
    return acc;
  }, {} as Record<string, { name: string; first: Track; count: number }>);

  const clips = items.filter((item) => item.kind === 'clip' && (!artistName || item.artist === artistName));

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{artistName ?? 'Artists'}</h1>
        {artistName && (
          <div className="flex items-center gap-2">
            <button onClick={() => input.current?.click()} className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black">
              Add clip
            </button>
            <button onClick={() => setArtistName(null)} className="text-sm text-[#b3b3b3] hover:text-white">
              All artists
            </button>
          </div>
        )}
      </div>
      {note && <p className="mb-4 text-sm text-[#1ED760]">{note}</p>}
      {artistName && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-white">Clips</h2>
          {clips.length === 0 ? (
            <p className="text-sm text-[#b3b3b3]">Short vertical videos, under 30 seconds, show up here.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {clips.map((item) => (
                <button key={item.id} onClick={() => setClip(item.url)} className="w-[120px] shrink-0 text-left">
                  <video src={item.url} muted className="aspect-[9/16] w-full rounded-lg bg-black object-cover" />
                  <div className="mt-1 truncate text-sm text-white">{item.title}</div>
                  <div className="text-xs text-[#b3b3b3]">{Math.round(item.duration)}s</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {Object.values(artists).length === 0 ? (
        <p className="text-[#b3b3b3]">Artists you save will show up here.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
          {(artistName ? Object.values(artists).filter((artist) => artist.name === artistName) : Object.values(artists)).map((artist) => (
            <button
              key={artist.name}
              onClick={() => (artistName ? playTrack(artist.first.id) : setArtistName(artist.name))}
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
      <input
        ref={input}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && artistName) {
            const track = tracks.find((item) => item.artist === artistName);
            void addClip({ artist: artistName, trackId: track?.id, file }).catch((error: Error) => setNote(error.message));
          }
          event.target.value = '';
        }}
      />
      {clip && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70" onClick={() => setClip(null)}>
          <video src={clip} controls autoPlay className="max-h-[80vh] aspect-[9/16] rounded-lg bg-black" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
