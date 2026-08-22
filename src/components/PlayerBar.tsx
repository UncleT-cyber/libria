import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useState, useEffect } from 'react';

export default function PlayerBar() {
  const { state, playTrack, pausePlayback, seekPlayback, setVolume, tick } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const [isLiked, setIsLiked] = useState(false);
  const [volumePercent, setVolumePercent] = useState(100);
  const activeTrack = tracks.find((t) => t.id === state.currentTrack);

  // Simulate playback progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (state.isPlaying) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, tick]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseInt(e.target.value);
    seekPlayback(newPosition);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumePercent(Math.round(newVolume * 100));
    setVolume(newVolume);
  };

  return (
    <div className="h-24 bg-[#181818] border-t border-[#282828] flex items-center px-4">
      {/* Track Info */}
      <div className="w-72 flex items-center">
        <div className="w-14 h-14 bg-[#282828] rounded flex items-center justify-center mr-3 flex-shrink-0">
          <svg className="w-7 h-7 text-[#b3b3b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-medium text-[#fff] truncate text-sm hover:underline cursor-pointer">
            {activeTrack ? activeTrack.title : state.currentTrack ? 'Now Playing' : 'No track selected'}
          </div>
          <div className="text-xs text-[#b3b3b3] truncate">
            {activeTrack ? activeTrack.artist : state.currentTrack || 'Select a track to play'}
          </div>
        </div>
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="ml-3 text-[#b3b3b3] hover:text-[#fff] transition-colors"
        >
          <svg 
            className="w-5 h-5" 
            fill={isLiked ? "#1DB954" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center max-w-2xl">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-[#b3b3b3] hover:text-[#fff] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>
          
          <button 
            onClick={() => {
              if (state.currentTrack) {
                if (state.isPlaying) {
                  pausePlayback();
                } else {
                  playTrack(state.currentTrack);
                }
              }
            }}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
          >
            {state.isPlaying ? (
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <button className="text-[#b3b3b3] hover:text-[#fff] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-[#b3b3b3] w-10 text-right">
            {formatDuration(state.position)}
          </span>
          <input
            type="range"
            min="0"
            max={state.duration || 100}
            value={state.position}
            onChange={handleSeek}
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-[#b3b3b3] w-10">
            {formatDuration(state.duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="w-72 flex items-center justify-end gap-2">
        <button className="text-[#b3b3b3] hover:text-[#fff] transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white"
        />
        <span className="text-xs text-[#b3b3b3] w-10 text-right">{volumePercent}%</span>
      </div>
    </div>
  );
}