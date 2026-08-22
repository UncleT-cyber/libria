import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';

export default function SongsView() {
  const { tracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-libria-elevated">
        <h1 className="text-2xl font-light">Songs</h1>
        <p className="text-libria-secondary mt-1">{tracks.length} songs</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track.id)}
              className="flex items-center p-3 rounded-lg hover:bg-libria-surface cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{track.title}</div>
                <div className="text-sm text-libria-secondary truncate">
                  {track.artist}
                </div>
              </div>
              <div className="text-libria-secondary text-sm w-20 text-right">
                {formatDuration(track.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}