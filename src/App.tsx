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

  const handleMiniPlayer = async () => {
    // Toggle in-app mini player; also try native PiP as enhancement, but never block UI
    setIsMini((v) => !v);
    try {
      const w = window as unknown as { documentPictureInPicture?: { requestWindow: (opts: { width: number; height: number }) => Promise<Window> } };
      if (!isMini && w.documentPictureInPicture?.requestWindow) {
        // Best-effort PiP — if user has already toggled to mini, also open PiP window for true floating
        // Don't await failure; in-app mini already handles visibility
        w.documentPictureInPicture.requestWindow({ width: 360, height: 120 }).then((pipWin) => {
          pipWin.document.body.style.margin = '0';
          pipWin.document.body.innerHTML = `<div style="background:#121212;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">Libria Mini Player — close PiP to return</div>`;
        }).catch(() => {});
      }
    } catch {
      // ignore PiP failure — in-app mini already active
    }
  };

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
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden gap-2 p-2">
      {/* top 68px, main 1fr, player 90px */}
      <div className="h-[68px] shrink-0">
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
      <div className="flex-1 flex gap-2 min-h-0">
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

      <div className="h-[90px] shrink-0 bg-black">
        <div className="h-full bg-black rounded-lg flex items-center">
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

      {isMini && (
        <div className="fixed bottom-[98px] right-3 z-50 w-[360px] bg-[#181818] border border-[#282828] rounded-lg shadow-2xl flex items-center gap-3 p-3">
          <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center shrink-0">♫</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white truncate">Libria Mini Player</div>
            <div className="text-xs text-[#b3b3b3] truncate">Playback continues — click restore to return</div>
          </div>
          <button onClick={() => setIsMini(false)} className="px-3 py-1.5 bg-white text-black rounded-full text-sm font-bold hover:bg-[#f0f0f0]">Restore</button>
          <button onClick={() => setIsMini(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#282828] text-white hover:bg-[#2a2a2a]">×</button>
        </div>
      )}

      <AddMusicModal isOpen={showAddMusic} onClose={() => setShowAddMusic(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
