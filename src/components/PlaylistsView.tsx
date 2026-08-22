export default function PlaylistsView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-libria-elevated">
        <h1 className="text-2xl font-light">Playlists</h1>
        <p className="text-libria-secondary mt-1">Your playlists</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-medium mb-2">No playlists yet</h2>
          <p className="text-libria-secondary">
            Create your first playlist to get started
          </p>
        </div>
      </div>
    </div>
  );
}