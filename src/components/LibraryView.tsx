import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export default function LibraryView() {
  const { tracks, isLoading, error } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-libria-secondary">Loading library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-libria-error">Error: {error}</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-libria-elevated rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-libria-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="text-2xl font-medium text-libria-text mb-2">
          Your music library is empty
        </div>
        <div className="text-libria-secondary">
          Add music by scanning a folder or importing files
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-libria-text mb-1">Your Library</h1>
        <p className="text-libria-secondary">{tracks.length} tracks</p>
      </div>
      
      <div 
        ref={parentRef}
        className="flex-1 overflow-auto px-6 pb-6"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const track = tracks[virtualRow.index];
            return (
              <div
                key={track.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center group hover:bg-white/5 rounded-lg cursor-pointer transition-colors px-4"
                onClick={() => playTrack(track.id)}
              >
                <div className="w-12 h-12 bg-libria-elevated rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-libria-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-libria-text truncate group-hover:text-white transition-colors">{track.title}</div>
                  <div className="text-sm text-libria-secondary truncate">
                    {track.artist} • {track.album}
                  </div>
                </div>
                <div className="text-libria-secondary text-sm w-16 text-right">
                  {formatDuration(track.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}