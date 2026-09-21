import { useEffect } from 'react';

export default function Callback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (error) {
      window.location.href = `/?spotify_error=${encodeURIComponent(error)}`;
      return;
    }
    if (code) {
      // Exchange via Vercel function (keeps client_secret server-side)
      fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`)
        .then(() => {
          window.location.href = '/?spotify_connected=1';
        })
        .catch(() => {
          window.location.href = '/?spotify_error=exchange_failed';
        });
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <p className="text-sm text-zinc-400">Connecting to Spotify…</p>
    </div>
  );
}
