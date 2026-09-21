import { useEffect, useState } from 'react';
import { useLibraryStore } from './stores/library';
import Sidebar, { type ViewName } from './components/Sidebar';
import TopBar from './components/TopBar';
import HomeView from './components/HomeView';
import SongsView from './components/SongsView';
import AlbumsView from './components/AlbumsView';
import ArtistsView from './components/ArtistsView';
import PlaylistsView from './components/PlaylistsView';
import PlayerBar from './components/PlayerBar';
import NowPlayingPanel from './components/NowPlayingPanel';
import ListeningActivityPanel from './components/ListeningActivityPanel';
import LyricsPanel from './components/LyricsPanel';
import QueuePanel from './components/QueuePanel';
import DevicePanel from './components/DevicePanel';
import AddMusicModal from './components/AddMusicModal';
import SettingsModal from './components/SettingsModal';

function App() {
  const { fetchLibrary, fetchFavorites } = useLibraryStore();
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showListening, setShowListening] = useState(false);
  const [activePane, setActivePane] = useState<'lyrics' | 'queue' | 'device' | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchLibrary();
    fetchFavorites();
  }, [fetchLibrary, fetchFavorites]);

  const fullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  const togglePane = (pane: 'lyrics' | 'queue' | 'device') => {
    setActivePane((cur) => (cur === pane ? null : pane));
    setShowListening(false);
    setShowNowPlaying(false);
  };

  const handleMiniPlayer = async () => {
    try {
      // Use Document Picture-in-Picture if available, else fallback to mini window
      const w = window as unknown as { documentPictureInPicture?: { requestWindow: (opts: { width: number; height: number }) => Promise<Window> } };
      if (w.documentPictureInPicture?.requestWindow) {
        const pipWin = await w.documentPictureInPicture.requestWindow({ width: 400, height: 200 });
        pipWin.document.body.innerHTML = `<div style="background:#121212;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">Libria Mini Player</div>`;
      } else if (document.pictureInPictureEnabled) {
        const video = document.querySelector('video');
        if (video && (video as unknown as { requestPictureInPicture: () => Promise<void> }).requestPictureInPicture) {
          await (video as unknown as { requestPictureInPicture: () => Promise<void> }).requestPictureInPicture();
        } else {
          window.open(window.location.href, 'LibriaMini', 'width=400,height=200');
        }
      } else {
        window.open(window.location.href, 'LibriaMini', 'width=400,height=200');
      }
    } catch {
      window.open(window.location.href, 'LibriaMini', 'width=400,height=200');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'search':
        return <SongsView query={query} onAddMusic={() => setShowAddMusic(true)} />;
      case 'songs':
        return <SongsView onAddMusic={() => setShowAddMusic(true)} />;
      case 'albums':
        return <AlbumsView />;
      case 'artists':
        return <ArtistsView />;
      case 'playlists':
        return <PlaylistsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* grid: top-nav 64px | main 1fr | player 90px */}
      <div className="h-16 shrink-0">
        <TopBar
          currentView={currentView}
          query={query}
          onQueryChange={setQuery}
          onNavigate={setCurrentView}
          onOpenSettings={() => setShowSettings(true)}
          onToggleListening={() => {
            const next = !showListening;
            setShowListening(next);
            if (next) { setShowNowPlaying(false); setActivePane(null); }
            setExpanded(false);
          }}
          listeningOpen={showListening}
        />
      </div>

      {/* Workspace: sidebar | main | right-pane */}
      <div className="flex-1 flex gap-2 px-2 min-h-0">
        <Sidebar
          currentView={currentView}
          collapsed={collapsed}
          onViewChange={setCurrentView}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onAddMusic={() => setShowAddMusic(true)}
        />
        <main className="flex-1 bg-[#121212] rounded-lg overflow-y-auto flex flex-col min-w-0">
          {renderView()}
        </main>
        {showListening ? (
          <ListeningActivityPanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setShowListening(false)} onOpenSettings={() => setShowSettings(true)} />
        ) : activePane === 'lyrics' ? (
          <LyricsPanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setActivePane(null)} />
        ) : activePane === 'queue' ? (
          <QueuePanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setActivePane(null)} />
        ) : activePane === 'device' ? (
          <DevicePanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setActivePane(null)} />
        ) : showNowPlaying ? (
          <NowPlayingPanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setShowNowPlaying(false)} />
        ) : null}
      </div>

      <div className="h-[90px] shrink-0">
        <PlayerBar
          nowPlayingOpen={showNowPlaying || activePane !== null || showListening}
          onToggleNowPlaying={() => {
            const next = !showNowPlaying;
            setShowNowPlaying(next);
            if (next) { setShowListening(false); setActivePane(null); }
            setExpanded(false);
          }}
          activePane={activePane}
          onToggleLyrics={() => togglePane('lyrics')}
          onToggleQueue={() => togglePane('queue')}
          onToggleDevice={() => togglePane('device')}
          onToggleMini={handleMiniPlayer}
          onFullscreen={fullscreen}
        />
      </div>

      <AddMusicModal isOpen={showAddMusic} onClose={() => setShowAddMusic(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
