import { useEffect, useState } from 'react';
import type { Track } from '../stores/library';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';

const HIDDEN_KEY = 'libria-hidden-tracks';
const EXCLUDED_KEY = 'libria-excluded-tracks';

let sleepTimer: number | undefined;

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export function hiddenTrackIds(): string[] {
  return readIds(HIDDEN_KEY);
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const I = {
  plus: 'M8 1.5a.75.75 0 0 1 .75.75v5h5a.75.75 0 0 1 0 1.5h-5v5a.75.75 0 0 1-1.5 0v-5h-5a.75.75 0 0 1 0-1.5h5v-5A.75.75 0 0 1 8 1.5z',
  heart: 'M8 14s-5.2-3.2-5.2-6.4A2.9 2.9 0 0 1 8 5.6a2.9 2.9 0 0 1 5.2 2C13.2 10.8 8 14 8 14z',
  queue: 'M1.5 3h13v1.4h-13zm0 4.2h13v1.4h-13zm0 4.2h9v1.4h-9z',
  hide: 'M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8',
  ban: 'M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4zm-3.6 5.3h7.2v1.3H4.4z',
  clock: 'M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4zM7.3 4.2h1.4v4l2.6 1.6-.7 1.2-3.3-2V4.2z',
  radio: 'M8 6.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM4.2 8a3.8 3.8 0 0 1 7.6 0 3.8 3.8 0 0 1-7.6 0z',
  person: 'M8 8.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM3.4 13.2c.5-2 2.3-3 4.6-3s4.1 1 4.6 3H3.4z',
  credits: 'M3 3.2h10v1.2H3zm0 3h10v1.2H3zm0 3h6.5v1.2H3z',
  share: 'M8 2.2 4.6 5.6h2.2V10h2.4V5.6h2.2L8 2.2zM3 11.2h10V14H3z',
  chev: 'M6 3.2 10.8 8 6 12.8l-1-1L8.8 8 5 4.2z',
};

export default function TrackMenu({
  track,
  anchor,
  onClose,
  onArtist,
}: {
  track: Track;
  anchor: DOMRect;
  onClose: () => void;
  onArtist?: (artist: string) => void;
}) {
  const { favorites, toggleFavorite, tracks } = useLibraryStore();
  const { enqueue, playTrack, pausePlayback } = usePlayerStore();
  const [panel, setPanel] = useState<'playlist' | 'sleep' | 'share' | 'credits' | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const liked = favorites.includes(track.id);
  const excluded = readIds(EXCLUDED_KEY).includes(track.id);
  const menuHeight = 420;
  const top = Math.max(8, Math.min(anchor.bottom + 6, window.innerHeight - menuHeight - 8));
  const left = Math.max(8, Math.min(anchor.right - 280, window.innerWidth - 292));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const hide = () => {
    const ids = readIds(HIDDEN_KEY);
    if (!ids.includes(track.id)) writeIds(HIDDEN_KEY, [...ids, track.id]);
    onClose();
  };

  const exclude = () => {
    const ids = readIds(EXCLUDED_KEY);
    writeIds(
      EXCLUDED_KEY,
      ids.includes(track.id) ? ids.filter((id) => id !== track.id) : [...ids, track.id],
    );
    setNote(ids.includes(track.id) ? 'Included in your taste profile' : 'Excluded from your taste profile');
  };

  const sleep = (minutes: number) => {
    window.clearTimeout(sleepTimer);
    if (minutes > 0) {
      sleepTimer = window.setTimeout(() => {
        void pausePlayback();
      }, minutes * 60 * 1000);
    }
    setNote(minutes ? `Sleep timer: ${minutes} min` : 'Sleep timer off');
  };

  const radio = () => {
    const next = tracks.find((item) => item.artist === track.artist && item.id !== track.id && item.file_path);
    if (next) void playTrack(next.id);
    else setNote('No other songs by this artist yet');
    if (next) onClose();
  };

  const share = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote('Copied');
    } catch {
      setNote('Could not copy');
    }
  };

  const item = (label: string, icon: string, action: () => void, extra?: string) => (
    <button
      onClick={action}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
    >
      {label === 'Save to your Liked Songs' || label === 'Remove from your Liked Songs' ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#8d67e8] text-white">
          <Icon d={I.heart} />
        </span>
      ) : (
        <Icon d={icon} />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {extra && <span className="text-[#b3b3b3]">{extra}</span>}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[70]" onClick={onClose} />
      <div
        className="fixed z-[80] w-[280px] overflow-hidden rounded-md bg-[#282828] py-1 text-white shadow-2xl"
        style={{ top, left }}
      >
        {item('Add to playlist', I.plus, () => setPanel(panel === 'playlist' ? null : 'playlist'), '›')}
        {panel === 'playlist' && (
          <button
            onClick={() => {
              if (!liked) void toggleFavorite(track.id);
              setNote(liked ? 'Already in Liked Songs' : 'Saved to Liked Songs');
            }}
            className="mx-2 mb-1 block w-[calc(100%-16px)] rounded bg-[#3e3e3e] px-3 py-2 text-left text-sm hover:bg-[#4a4a4a]"
          >
            Liked Songs
          </button>
        )}
        {item(liked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs', I.heart, () => void toggleFavorite(track.id))}
        {item('Add to queue', I.queue, () => {
          enqueue(track.id);
          setNote('Added to queue');
        })}
        {item('Hide in this album', I.hide, hide)}
        {item(excluded ? 'Include in your taste profile' : 'Exclude from your taste profile', I.ban, exclude)}
        {item('Sleep timer', I.clock, () => setPanel(panel === 'sleep' ? null : 'sleep'), '›')}
        {panel === 'sleep' && (
          <div className="mx-2 mb-1 rounded bg-[#3e3e3e] py-1">
            {[0, 5, 15, 30, 45, 60].map((minutes) => (
              <button key={minutes} onClick={() => sleep(minutes)} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-white/10">
                {minutes === 0 ? 'Off' : `${minutes} minutes`}
              </button>
            ))}
          </div>
        )}
        <div className="my-1 h-px bg-[#3e3e3e]" />
        {item('Go to song radio', I.radio, radio)}
        {item('Go to artist', I.person, () => {
          onArtist?.(track.artist);
          onClose();
        })}
        {item('View credits', I.credits, () => setPanel(panel === 'credits' ? null : 'credits'))}
        {panel === 'credits' && (
          <div className="mx-3 mb-2 text-xs leading-5 text-[#b3b3b3]">
            <div className="text-white">{track.title}</div>
            <div>{track.artist}</div>
            <div>{track.album || 'Single'}</div>
          </div>
        )}
        {item('Share', I.share, () => setPanel(panel === 'share' ? null : 'share'), '›')}
        {panel === 'share' && (
          <div className="mx-2 mb-1 rounded bg-[#3e3e3e] py-1">
            <button onClick={() => share(`${track.title} — ${track.artist}`)} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-white/10">
              Copy song
            </button>
            <button onClick={() => share(`${track.title} by ${track.artist}${track.album ? ` · ${track.album}` : ''}`)} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-white/10">
              Copy credits
            </button>
          </div>
        )}
        {note && <div className="px-3 py-2 text-xs text-[#1ED760]">{note}</div>}
      </div>
    </>
  );
}
