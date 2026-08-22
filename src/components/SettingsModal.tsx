import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    musicFolders: [] as string[],
    theme: 'dark',
    outputDevice: 'default',
    autoOrganize: false,
    formatTemplate: '{Artist}/{Album}/{TrackNumber} - {Title}',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#181818] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#282828] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors p-2 hover:bg-[#282828] rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Music Folders */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Music Folders</h3>
            <div className="space-y-2">
              {settings.musicFolders.length === 0 ? (
                <p className="text-[#b3b3b3]">No folders added yet</p>
              ) : (
                settings.musicFolders.map((folder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                    <span className="text-white truncate">{folder}</span>
                    <button className="text-[#b3b3b3] hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
              <button className="w-full p-3 border-2 border-dashed border-[#282828] rounded-lg text-[#b3b3b3] hover:border-[#b3b3b3] hover:text-white transition-colors">
                + Add Folder
              </button>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Audio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-2">Output Device</label>
                <select 
                  className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
                  value={settings.outputDevice}
                  onChange={(e) => setSettings({...settings, outputDevice: e.target.value})}
                >
                  <option value="default">Default Device</option>
                  <option value="speakers">Speakers</option>
                  <option value="headphones">Headphones</option>
                </select>
              </div>
            </div>
          </div>

          {/* Library Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Library</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Auto-organize files</div>
                  <div className="text-sm text-[#b3b3b3]">Automatically organize imported files</div>
                </div>
                <button 
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoOrganize ? 'bg-[#1DB954]' : 'bg-[#282828]'
                  }`}
                  onClick={() => setSettings({...settings, autoOrganize: !settings.autoOrganize})}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.autoOrganize ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-2">File Organization Template</label>
                <input 
                  type="text"
                  className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
                  value={settings.formatTemplate}
                  onChange={(e) => setSettings({...settings, formatTemplate: e.target.value})}
                />
                <div className="text-xs text-[#b3b3b3] mt-1">
                  Available: {Artist}, {Album}, {TrackNumber}, {Title}, {Year}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
            <div>
              <label className="block text-sm font-medium text-[#b3b3b3] mb-2">Theme</label>
              <select 
                className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#282828] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full font-medium text-white hover:bg-[#282828] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full font-medium text-black bg-[#1DB954] hover:bg-[#1ed760] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}