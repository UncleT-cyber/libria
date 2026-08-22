import { useEffect, useState } from 'react';
import { invokeBackend } from '../api/backend';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOGGLE_KEYS = ['explicit_content_allowed', 'auto_play_enabled', 'dark_mode'] as const;
const TOGGLE_LABELS: Record<string, string> = {
  explicit_content_allowed: 'Allow explicit content',
  auto_play_enabled: 'Autoplay',
  dark_mode: 'Dark mode',
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    invokeBackend('get_settings')
      .then((settings) => {
        setValues(settings);
        setLoadError(null);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : String(error));
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(values)) {
        await invokeBackend('set_setting', { key, value });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

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
          {loadError && (
            <p className="text-red-400 text-sm mb-4">
              Settings backend unavailable: {loadError}
            </p>
          )}

          {/* Credentials & Keys */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Spotify Credentials</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-2">SPOTIFY_CLIENT_ID</label>
                <input
                  type="text"
                  className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
                  value={values.SPOTIFY_CLIENT_ID ?? ''}
                  onChange={(e) => update('SPOTIFY_CLIENT_ID', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-2">SPOTIFY_CLIENT_SECRET</label>
                <input
                  type="password"
                  className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
                  value={values.SPOTIFY_CLIENT_SECRET ?? ''}
                  onChange={(e) => update('SPOTIFY_CLIENT_SECRET', e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Audio resolution */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Audio Quality</h3>
            <div className="flex gap-2">
              {['128kbps', '256kbps', '320kbps'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => update('audio_quality', quality)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    values.audio_quality === quality
                      ? 'bg-[#1DB954] text-black'
                      : 'bg-[#282828] text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Download directory */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Archival</h3>
            <label className="block text-sm font-medium text-[#b3b3b3] mb-2">Download directory</label>
            <input
              type="text"
              className="w-full bg-[#282828] text-white p-3 rounded-lg border border-[#282828] focus:border-[#1DB954] outline-none"
              value={values.download_directory ?? './downloads'}
              onChange={(e) => update('download_directory', e.target.value)}
            />
          </div>

          {/* Operational toggles */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Playback & Interface</h3>
            <div className="space-y-4">
              {TOGGLE_KEYS.map((key) => {
                const enabled = values[key] === 'true';
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="text-white font-medium">{TOGGLE_LABELS[key]}</div>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        enabled ? 'bg-[#1DB954]' : 'bg-[#282828]'
                      }`}
                      onClick={() => update(key, enabled ? 'false' : 'true')}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
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
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-full font-medium text-black bg-[#1DB954] hover:bg-[#1ed760] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
