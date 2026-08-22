import { useEffect, useState } from 'react';
import { useLibraryStore } from './stores/library';
import LibraryView from './components/LibraryView';
import SongsView from './components/SongsView';
import AlbumsView from './components/AlbumsView';
import ArtistsView from './components/ArtistsView';
import PlaylistsView from './components/PlaylistsView';
import PlayerBar from './components/PlayerBar';
import Sidebar from './components/Sidebar';

type ViewType = 'library' | 'songs' | 'albums' | 'artists' | 'playlists';

function App() {
  const { fetchLibrary } = useLibraryStore();
  const [currentView, setCurrentView] = useState<ViewType>('library');

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const renderView = () => {
    switch (currentView) {
      case 'library':
        return <LibraryView />;
      case 'songs':
        return <SongsView />;
      case 'albums':
        return <AlbumsView />;
      case 'artists':
        return <ArtistsView />;
      case 'playlists':
        return <PlaylistsView />;
      default:
        return <LibraryView />;
    }
  };

  return (
    <div className="flex h-screen bg-libria-background text-libria-text">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderView()}
        <PlayerBar />
      </main>
    </div>
  );
}

export default App;