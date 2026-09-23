import { useEffect, useState } from 'react';
import { useLibraryStore } from './stores/library';
import Sidebar, { type ViewName } from './components/Sidebar';
import TopBar from './components/TopBar';
import HomeView from './components/HomeView';
import SongsView from './components/SongsView';
import AlbumsView from './components/AlbumsView';
import ArtistsView from './components/ArtistsView';
import PlaylistsView from './components/PlaylistsView';
import DownloadsView from './components/DownloadsView';
import MiniPlayer from './components/MiniPlayer';
import PlayerBar from './components/PlayerBar';
import NowPlayingPanel from './components/NowPlayingPanel';
import ListeningActivityPanel from './components/ListeningActivityPanel';
import LyricsPanel from './components/LyricsPanel';
import QueuePanel from './components/QueuePanel';
import DevicePanel from './components/DevicePanel';
import AddMusicModal from './components/AddMusicModal';
import SettingsModal from './components/SettingsModal';

function App() {
  const { fetchLibrary, fetchFavorites, isLoading } = useLibraryStore();
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [history, setHistory] = useState<ViewName[]>(['home']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showListening, setShowListening] = useState(false);
  const [activePane, setActivePane] = useState<'lyrics' | 'queue' | 'device' | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMini, setIsMini] = useState(false);

  useEffect(() => {
    fetchLibrary();
    fetchFavorites();
  }, [fetchLibrary, fetchFavorites]);

  useEffect(() => {
    if (window.matchMedia('(min-width: 1100px)').matches) setActivePane('queue');
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Tauri fallback: use Tauri window API if available
      const tauriWin = (window as unknown as { __TAURI__?: { window: { getCurrentWindow: () => { isFullscreen: () => Promise<boolean>; setFullscreen: (v: boolean) => Promise<void> } } } }).__TAURI__?.window?.getCurrentWindow;
      if (tauriWin) {
        try {
          const w = tauriWin();
          const fs = await w.isFullscreen();
          await w.setFullscreen(!fs);
          setIsFullscreen(!fs);
        } catch {
          // ignore
        }
      }
    }
  };

  const togglePane = (pane: 'lyrics' | 'queue' | 'device') => {
    setActivePane((cur) => (cur === pane ? null : pane));
    setShowListening(false);
    setShowNowPlaying(false);
  };

  const handleMiniPlayer = () => setIsMini((open) => !open);

  const navigate = (view: ViewName) => {
    if (view === currentView) return;
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(view);
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setCurrentView(view);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      setCurrentView(history[idx]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1;
      setHistoryIdx(idx);
      setCurrentView(history[idx]);
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
      case 'downloads':
        return <DownloadsView onAddMusic={() => setShowAddMusic(true)} />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      <div className="h-16 shrink-0">
        <TopBar
          currentView={currentView}
          query={query}
          onQueryChange={setQuery}
          onNavigate={navigate}
          onGoBack={goBack}
          onGoForward={goForward}
          canGoBack={historyIdx > 0}
          canGoForward={historyIdx < history.length - 1}
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

      {/* Workspace: sidebar | main | right-pane - 8px gap from player */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 px-2 pb-2">
      <div className="flex min-h-0 flex-1 gap-2">
        <Sidebar
          currentView={currentView}
          collapsed={collapsed}
          onViewChange={navigate}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onAddMusic={() => setShowAddMusic(true)}
        />
        <main className="flex-1 bg-[#121212] rounded-lg overflow-y-auto flex flex-col min-w-0 relative">
          {isLoading && (
            <div className="sticky top-0 z-20 h-1 bg-[#282828]">
              <div className="h-full w-1/3 bg-[#1DB954] animate-pulse" />
            </div>
          )}
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
          <NowPlayingPanel expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} onClose={() => setShowNowPlaying(false)} onLyrics={() => togglePane('lyrics')} />
        ) : null}
      </div>

      <div className="h-[72px] shrink-0 bg-black">
        <PlayerBar
            activePane={activePane}
            isMiniActive={isMini}
            isFullscreenActive={isFullscreen}
            onToggleLyrics={() => togglePane('lyrics')}
            onToggleQueue={() => togglePane('queue')}
            onToggleDevice={() => togglePane('device')}
            onToggleMini={handleMiniPlayer}
            onToggleNowPlaying={() => {
              const next = !showNowPlaying;
              setShowNowPlaying(next);
              if (next) { setShowListening(false); setActivePane(null); }
              setExpanded(false);
            }}
            onFullscreen={fullscreen}
          />
      </div>
      </div>

      {isMini && <MiniPlayer onClose={() => setIsMini(false)} />}

      <AddMusicModal
        isOpen={showAddMusic}
        onClose={() => setShowAddMusic(false)}
        onImported={() => navigate('downloads')}
      />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
