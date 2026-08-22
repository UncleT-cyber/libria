import { useEffect, useRef, useState } from 'react';
import { useLibraryStore } from '../stores/library';
import { isTauri } from '../api/backend';
import {
  CloseIcon,
  ChevronRightIcon,
  FolderIcon,
  DownloadIcon,
  SpotifyMarkIcon,
} from './icons';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'menu' | 'folder' | 'spotify';

export default function AddMusicModal({ isOpen, onClose }: AddMusicModalProps) {
  const [mode, setMode] = useState<Mode>('menu');
  const [folderPath, setFolderPath] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scanFolder, importFiles, importSpotify } = useLibraryStore();

  useEffect(() => {
    if (isOpen) {
      setMode('menu');
      setError(null);
      setBusy(false);
      setSpotifyUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleScanFolder = async () => {
    if (isTauri) {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({ directory: true, multiple: false, title: 'Select Music Folder' });
      if (selected && typeof selected === 'string') {
        await run(() => scanFolder(selected));
      }
      return;
    }
    setMode('folder');
  };

  const handleImportFiles = async () => {
    if (isTauri) {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: true,
        filters: [{ name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma', 'aiff', 'opus'] }],
        title: 'Import Music Files',
      });
      if (selected && Array.isArray(selected) && selected.length > 0) {
        await run(() => importFiles(selected));
      }
      return;
    }
    fileInputRef.current?.click();
  };

  const options = [
    {
      id: 'folder' as const,
      title: 'Scan a folder',
      description: 'Index every audio file inside a directory on this machine',
      icon: <FolderIcon className="w-6 h-6" />,
      action: handleScanFolder,
    },
    {
      id: 'files' as const,
      title: 'Import files',
      description: 'Add individual audio files to your library',
      icon: <DownloadIcon className="w-6 h-6" />,
      action: handleImportFiles,
    },
    {
      id: 'spotify' as const,
      title: 'Spotify URL',
      description: 'Paste a track, album, or playlist link to stream & archive it',
      icon: <SpotifyMarkIcon className="w-6 h-6" />,
      action: () => setMode('spotify'),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#282828] rounded-lg w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'menu' && 'Add music to Libria'}
            {mode === 'folder' && 'Scan a folder'}
            {mode === 'spotify' && 'Import from Spotify'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1 rounded-full hover:bg-[#3e3e3e]"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pb-6">
          {mode === 'menu' && (
            <div className="space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={opt.action}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-md hover:bg-[#3e3e3e] transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-[#181818] rounded-md flex items-center justify-center text-[#b3b3b3] group-hover:text-white transition-colors flex-shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{opt.title}</div>
                    <div className="text-sm text-[#b3b3b3]">{opt.description}</div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#6a6a6a] group-hover:text-white transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {mode === 'folder' && (
            <div className="px-3 space-y-4">
              <p className="text-sm text-[#b3b3b3]">
                Enter the absolute path of a music folder on the machine running Libria.
              </p>
              <input
                type="text"
                autoFocus
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && folderPath.trim() && run(() => scanFolder(folderPath.trim()))}
                placeholder="/home/you/Music"
                className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md border border-transparent focus:border-white outline-none placeholder-[#6a6a6a]"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMode('menu')}
                  className="px-5 py-2 rounded-full font-semibold text-white hover:scale-105 transition-transform"
                >
                  Back
                </button>
                <button
                  onClick={() => folderPath.trim() && run(() => scanFolder(folderPath.trim()))}
                  disabled={busy || !folderPath.trim()}
                  className="px-5 py-2 rounded-full font-semibold text-black bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {busy ? 'Scanning…' : 'Scan'}
                </button>
              </div>
            </div>
          )}

          {mode === 'spotify' && (
            <div className="px-3 space-y-4">
              <p className="text-sm text-[#b3b3b3]">
                Paste a Spotify track, album, or playlist link. The track enters your library
                immediately and the download queue archives it to disk.
              </p>
              <input
                type="text"
                autoFocus
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && spotifyUrl.trim() && run(() => importSpotify(spotifyUrl.trim()))}
                placeholder="https://open.spotify.com/track/…"
                className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md border border-transparent focus:border-white outline-none placeholder-[#6a6a6a]"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMode('menu')}
                  className="px-5 py-2 rounded-full font-semibold text-white hover:scale-105 transition-transform"
                >
                  Back
                </button>
                <button
                  onClick={() => spotifyUrl.trim() && run(() => importSpotify(spotifyUrl.trim()))}
                  disabled={busy || !spotifyUrl.trim()}
                  className="px-5 py-2 rounded-full font-semibold text-black bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {busy ? 'Importing…' : 'Import'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="px-3 pt-4 text-sm text-[#fb7185]">{error}</p>}
        </div>

        {/* Hidden file picker for browser-mode file import */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac,.wma,.aiff,.opus"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) {
              run(() => importFiles(files.map((f) => (f as File & { path?: string }).path ?? f.name)));
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
