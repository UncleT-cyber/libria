import { MusicNoteIcon } from './icons';

export default function PlaylistsView() {
  return (
    <div className="px-6 py-10">
      <div className="max-w-sm bg-[#242424] rounded-lg p-6">
        <MusicNoteIcon className="w-10 h-10 text-[#1DB954] mb-4" />
        <h2 className="text-xl font-bold text-white mb-1">Create your first playlist</h2>
        <p className="text-sm text-[#b3b3b3] mb-4">
          Playlists are coming. For now, Your Library has everything you scan, import, or pull from Spotify.
        </p>
        <button className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform opacity-50 cursor-not-allowed">
          Create playlist
        </button>
      </div>
    </div>
  );
}
