import { create } from 'zustand';

export type VisualKind = 'cover' | 'canvas' | 'clip';

export interface Visual {
  id: string;
  kind: VisualKind;
  trackId?: string;
  artist?: string;
  title: string;
  url: string;
  duration: number;
}

type Row = Omit<Visual, 'url'> & { blob: Blob };

const DB = 'libria-visuals';
const STORE = 'items';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function ask<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function mediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    el.src = url;
  });
}

async function put(row: Row) {
  const db = await openDb();
  await ask(db.transaction(STORE, 'readwrite').objectStore(STORE).put(row));
}

interface VisualStore {
  items: Visual[];
  ready: boolean;
  load: () => Promise<void>;
  setCover: (trackId: string, file: File, title: string) => Promise<void>;
  setCanvas: (trackId: string, file: File, title: string) => Promise<void>;
  addClip: (input: { artist: string; trackId?: string; file: File }) => Promise<void>;
}

let loading: Promise<void> | null = null;

export const useVisuals = create<VisualStore>((set, get) => ({
  items: [],
  ready: false,

  load: async () => {
    if (get().ready) return;
    if (!loading) {
      loading = (async () => {
        const db = await openDb();
        const rows = (await ask(db.transaction(STORE, 'readonly').objectStore(STORE).getAll())) as Row[];
        set({
          ready: true,
          items: rows.map((row) => ({
            id: row.id,
            kind: row.kind,
            trackId: row.trackId,
            artist: row.artist,
            title: row.title,
            duration: row.duration,
            url: URL.createObjectURL(row.blob),
          })),
        });
      })();
    }
    await loading;
  },

  setCover: async (trackId, file, title) => {
    const id = `cover:${trackId}`;
    await put({ id, kind: 'cover', trackId, title, duration: 0, blob: file });
    const url = URL.createObjectURL(file);
    set((state) => ({ items: [...state.items.filter((item) => item.id !== id), { id, kind: 'cover', trackId, title, duration: 0, url }] }));
  },

  setCanvas: async (trackId, file, title) => {
    const duration = await mediaDuration(file);
    if (duration > 8.2) throw new Error('Canvas has to be 8 seconds or shorter.');
    const id = `canvas:${trackId}`;
    await put({ id, kind: 'canvas', trackId, title, duration, blob: file });
    const url = URL.createObjectURL(file);
    set((state) => ({ items: [...state.items.filter((item) => item.id !== id), { id, kind: 'canvas', trackId, title, duration, url }] }));
  },

  addClip: async ({ artist, trackId, file }) => {
    const duration = await mediaDuration(file);
    if (!duration || duration > 30) throw new Error('Clips have to be under 30 seconds.');
    const id = `clip:${crypto.randomUUID()}`;
    const title = file.name.replace(/\.[^.]+$/, '');
    await put({ id, kind: 'clip', trackId, artist, title, duration, blob: file });
    const url = URL.createObjectURL(file);
    set((state) => ({ items: [...state.items, { id, kind: 'clip', trackId, artist, title, duration, url }] }));
  },
}));

export function coverFor(items: Visual[], trackId?: string | null) {
  return items.find((item) => item.kind === 'cover' && item.trackId === trackId);
}

export function canvasFor(items: Visual[], trackId?: string | null) {
  return items.find((item) => item.kind === 'canvas' && item.trackId === trackId);
}

export async function saveImage(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
