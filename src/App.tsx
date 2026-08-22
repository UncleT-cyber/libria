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
      {/* Single unified header row: window controls / breadcrumbs / search / profile */}
      <TopBar
        currentView={currentView}
        query={query}
        onQueryChange={setQuery}
        onNavigate={setCurrentView}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Workspace spans from under the header to the playback deck */}
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
        {showNowPlaying && (
          <div className="p-0">
            <NowPlayingPanel />
          </div>
        )}
      </div>

      <PlayerBar
        nowPlayingOpen={showNowPlaying}
        onToggleNowPlaying={() => setShowNowPlaying((v) => !v)}
        onFullscreen={fullscreen}
      />

      <AddMusicModal isOpen={showAddMusic} onClose={() => setShowAddMusic(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
