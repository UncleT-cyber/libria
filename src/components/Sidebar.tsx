import { useState } from 'react';
import { useLibraryStore } from '../stores/library';
import { isTauri } from '../api/backend';
import SettingsModal from './SettingsModal';

type ViewName = 'library' | 'songs' | 'albums' | 'artists' | 'playlists';

interface SidebarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { scanFolder, importFiles } = useLibraryStore();

  const handleFolderSelect = async () => {
    if (!isTauri) {
      // Browser mode: ask for a server-side path (default = ~/Music)
      const input = window.prompt(
        'Enter the music folder on this machine to scan (server-side path):',
        '/root/Music',
      );
      if (input) {
        await scanFolder(input.trim());
      }
      return;
    }
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Music Folder',
      });
      if (selected && typeof selected === 'string') {
        await scanFolder(selected);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to select folder:', error);
    }
  };

  const handleFileImport = async () => {
    if (!isTauri) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'audio/*,.mp3,.flac,.wav,.ogg,.m4a,.aac,.wma,.aiff,.opus';
      input.onchange = async () => {
        const files = Array.from(input.files ?? []);
        if (files.length > 0) {
          // Browsers expose only synthetic paths for picked files; pass what we have.
          await importFiles(files.map((f) => (f as File & { path?: string }).path ?? f.name));
        }
      };
      input.click();
      return;
    }
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Audio Files',
          extensions: ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma', 'aiff']
        }],
        title: 'Import Music Files',
      });
      if (selected && Array.isArray(selected) && selected.length > 0) {
        await importFiles(selected);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to import files:', error);
    }
  };

  const menuItems: { id: ViewName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'library', label: 'Library', icon: HomeIcon },
    { id: 'songs', label: 'Songs', icon: MusicIcon },
    { id: 'albums', label: 'Albums', icon: AlbumIcon },
    { id: 'artists', label: 'Artists', icon: ArtistIcon },
    { id: 'playlists', label: 'Playlists', icon: PlaylistIcon },
  ];

  return (
    <>
      <div 
        className={`bg-libria-surface border-r border-libria-elevated flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-libria-elevated flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-semibold text-libria-violet">Libria</h1>
              <p className="text-xs text-libria-secondary mt-1">Your music. Your library.</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-libria-elevated text-libria-secondary hover:text-libria-text transition-colors"
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-libria-secondary uppercase tracking-wider mb-3">
                Library
              </h2>
            )}
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-libria-violet text-white'
                        : 'text-libria-secondary hover:bg-libria-elevated hover:text-libria-text'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-libria-secondary uppercase tracking-wider mb-3">
                Add Music
              </h2>
            )}
            <div className="space-y-2">
              <button
                onClick={handleFolderSelect}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-libria-secondary hover:bg-libria-elevated hover:text-libria-text transition-colors"
                title={isCollapsed ? 'Scan Folder' : undefined}
              >
                <FolderIcon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Scan Folder</span>}
              </button>
              <button
                onClick={handleFileImport}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-libria-secondary hover:bg-libria-elevated hover:text-libria-text transition-colors"
                title={isCollapsed ? 'Import Files' : undefined}
              >
                <DownloadIcon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Import Files</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-libria-elevated">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-libria-secondary hover:bg-libria-elevated hover:text-libria-text transition-colors"
            title={isCollapsed ? 'Settings' : undefined}
          >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </div>
      
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
    </>
  );
}

// Modern SVG Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}

function AlbumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ArtistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PlaylistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}