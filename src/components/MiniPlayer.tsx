import { useEffect, useRef, useState } from 'react';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { canvasFor, coverFor, saveImage, useVisuals } from '../lib/visuals';
import CanvasView from './CanvasView';
import { CloseIcon, MusicNoteIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, PlayerVolumeIcon, PlayerVolumeMuteIcon } from './icons';

const fmt = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function MiniPlayer({ onClose }: { onClose: () => void }) {
  const { state, playTrack, pausePlayback, seekPlayback, setVolume } = usePlayerStore();
  const { tracks } = useLibraryStore();
  const { items, load, setCover, setCanvas } = useVisuals();
  const [muted, setMuted] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [note, setNote] = useState('');
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const canvasInput = useRef<HTMLInputElement>(null);
  const track = tracks.find((t) => t.id === state.currentTrack);
  const playable = tracks.filter((t) => !!t.file_path);
  const progress = state.duration > 0 ? Math.min(100, (state.position / state.duration) * 100) : 0;
  const canvas = canvasFor(items, track?.id);
  const cover = coverFor(items, track?.id)?.url || track?.artwork_url;
  const volumeShown = muted ? 0 : state.volume;

  useEffect(() => {
    void load();
  }, [load]);

  const playNeighbor = (dir: 1 | -1) => {
    if (playable.length === 0) return;
    const index = playable.findIndex((t) => t.id === state.currentTrack);
    const next = index === -1 ? 0 : (index + dir + playable.length) % playable.length;
    playTrack(playable[next].id);
  };

  const togglePlay = () => {
    if (state.isPlaying) pausePlayback();
    else if (state.currentTrack) playTrack(state.currentTrack);
  };

  return (
    <div
      className="fixed bottom-[84px] right-3 z-[80] w-[360px] overflow-hidden rounded-lg border border-[#3e3e3e] bg-[#121212] shadow-2xl"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <div
        className="flex cursor-grab items-center gap-3 px-3 py-2.5 active:cursor-grabbing"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest('button, input, video')) return;
          drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + event.clientX - drag.current.x,
            y: drag.current.oy + event.clientY - drag.current.y,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <button
          title={cover ? 'Save cover' : 'Add cover'}
          onClick={() => {
            if (cover && track) void saveImage(cover, `${track.artist} - ${track.title}.jpg`);
            else coverInput.current?.click();
          }}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-[#282828] text-[#b3b3b3]"
        >
          {state.isPlaying && canvas ? (
            <CanvasView src={canvas.url} className="h-full w-full object-cover" />
          ) : cover ? (
            <img src={cover} alt="" draggable onDragStart={(event) => event.dataTransfer.setData('text/uri-list', cover)} className="h-full w-full object-cover" />
          ) : (
            <MusicNoteIcon className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-white">{track?.title ?? 'Nothing playing'}</div>
          <div className="truncate text-xs text-[#b3b3b3]">{track?.artist ?? 'Pick a song in your library'}</div>
          {canvas && state.isPlaying && <div className="text-[10px] text-[#1ED760]">Canvas</div>}
        </div>
        <button onClick={() => playNeighbor(-1)} title="Previous" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <PrevIcon className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlay}
          title={state.isPlaying ? 'Pause' : 'Play'}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
        >
          {state.isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
        </button>
        <button onClick={() => playNeighbor(1)} title="Next" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <NextIcon className="h-4 w-4" />
        </button>
        <button onClick={onClose} title="Close mini player" className="flex h-8 w-8 items-center justify-center text-[#b3b3b3] hover:text-white">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-1">
        <button onClick={() => setMuted((value) => !value)} title="Mute" className="text-[#b3b3b3] hover:text-white">
          {muted || state.volume === 0 ? <PlayerVolumeMuteIcon className="h-4 w-4" /> : <PlayerVolumeIcon className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volumeShown}
          aria-label="Volume"
          onChange={(event) => {
            const value = Number(event.target.value);
            setVolume(value);
            setMuted(value === 0);
          }}
          className="spotify-range h-1 flex-1"
          style={{ background: `linear-gradient(to right, #fff ${volumeShown * 100}%, #535353 ${volumeShown * 100}%)` }}
        />
        <button onClick={() => coverInput.current?.click()} className="text-[10px] text-[#b3b3b3] hover:text-white" title="Attach a cover image">
          Cover
        </button>
        <button onClick={() => canvasInput.current?.click()} className="text-[10px] text-[#b3b3b3] hover:text-white" title="Attach an 8 second canvas">
          Canvas
        </button>
      </div>
      {note && <div className="px-3 pb-1 text-[10px] text-[#1ED760]">{note}</div>}
      <button
        type="button"
        title="Seek"
        className="relative block h-1 w-full bg-[#4d4d4d]"
        onClick={(event) => {
          if (!state.duration) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          seekPlayback(ratio * state.duration);
        }}
      >
        <span className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress}%` }} />
      </button>
      <div className="flex justify-between px-3 py-1 text-[10px] text-[#a7a7a7]">
        <span>{fmt(state.position)}</span>
        <span>{fmt(state.duration)}</span>
      </div>
      <input
        ref={coverInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && track) void setCover(track.id, file, track.title);
          event.target.value = '';
        }}
      />
      <input
        ref={canvasInput}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && track) {
            void setCanvas(track.id, file, track.title).catch((error: Error) => setNote(error.message));
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}
