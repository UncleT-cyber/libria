import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true as const,
  ...props,
});

export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" /></svg>
);

export const HomeOutlineIcon = (p: P) => (
  <svg {...base(p)}><path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33zM4 7.577l8-4.62 8 4.62V20h-4v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6H4V7.577z" /></svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)}><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z" /></svg>
);

export const LibraryIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" /></svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)}><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" /></svg>
);

export const PlayIcon = (p: P) => (
  <svg {...base(p)}><path d="m7.05 3.606 13.537 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" /></svg>
);

export const PauseIcon = (p: P) => (
  <svg {...base(p)}><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z" /></svg>
);

export const NextIcon = (p: P) => (
  <svg {...base(p)}><path d="M12.7 1a.7.7 0 0 0-.7.7v5.392L6.05 1.107A.7.7 0 0 0 5 1.712v20.575a.7.7 0 0 0 1.05.607L12 16.907v5.393a.7.7 0 0 0 .7.7h.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-.6z" /></svg>
);

export const PrevIcon = (p: P) => (
  <svg {...base(p)}><path d="M11.3 1a.7.7 0 0 1 .7.7v5.392l5.95-5.985A.7.7 0 0 1 19 1.712v20.575a.7.7 0 0 1-1.05.607L12 16.907v5.393a.7.7 0 0 1-.7.7h-.6a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h.6z" /></svg>
);

export const ShuffleIcon = (p: P) => (
  <svg {...base(p)}><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5zm7.547 8.03l-.994 1.185a.75.75 0 0 0 1.07 1.05l1.484-1.768-.99-1.18-.99 1.182zm8.79-8.932h-1.32a.75.75 0 0 0 0 1.5h1.32a2.25 2.25 0 0 1 1.724.804l2.3 2.74 1.06-1.06-2.39-2.844a3.75 3.75 0 0 0-2.873-1.34zM16 10.75V13l4.5-3.75L16 5.5v2.25c-2.13 0-3.6 1.1-4.35 2.6.7.6 1.3 1.35 1.8 2.2.6-1.2 1.6-1.8 2.55-1.8z" /></svg>
);

export const RepeatIcon = (p: P) => (
  <svg {...base(p)}><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a.75.75 0 0 1-1.5 0v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A.75.75 0 0 1 0 9.75v-5zm12.25 6.75a.75.75 0 0 1 .75.75v5a2.25 2.25 0 0 1-2.25 2.25h-8.5a.75.75 0 0 1 0-1.5h8.5a.75.75 0 0 0 .75-.75v-5a.75.75 0 0 1 .75-.75z" /><path d="m11.5 8.5 3.5-3.5L11.5 1.5l-1.06 1.06L12.19 4.25 10.44 6l1.06 1.06 1.75-1.75L11.5 8.5zm-3 7L5 19l3.5 3.5 1.06-1.06-1.75-1.69L9.56 18l-1.06-1.06-1.75 1.75L8.5 15.5z" /></svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);

export const HeartFilledIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm.75-13a.75.75 0 0 0-1.5 0V12c0 .414.336.75.75.75h3.75a.75.75 0 0 0 0-1.5h-3V7.5z" /></svg>
);

export const MicIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm0 2a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1zm-5 5a1 1 0 0 1 2 0v2a3 3 0 0 0 6 0v-2a1 1 0 1 1 2 0v2a5 5 0 0 1-4 4.9V19h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.1A5 5 0 0 1 7 12v-2z" /></svg>
);

export const QueueIcon = (p: P) => (
  <svg {...base(p)}><path d="M15 15H4v-1.5h11V15zm0-4.5H4V9h11v1.5zm0-4.5H4V4.5h11V6zM18.5 4v10.2a3.5 3.5 0 1 0 1.5 2.8V4h-1.5z" /></svg>
);

export const VolumeIcon = (p: P) => (
  <svg {...base(p)}><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm6.925 4.401a.75.75 0 0 1 1.06 0 9.373 9.373 0 0 1 0 13.498.75.75 0 0 1-1.06-1.06 7.873 7.873 0 0 0 0-11.378.75.75 0 0 1 0-1.06z" /></svg>
);

export const VolumeMuteIcon = (p: P) => (
  <svg {...base(p)}><path d="M10.116 1.5a.75.75 0 0 0-1.125-.65l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L4.62 9.16a2.139 2.139 0 0 1-.781-2.92c.39-.601.915-.97 1.52-1.09l4.26-2.46v1.196c.5.194.975.47 1.395.822V2.625a.747.747 0 0 0-.9-1.125z" /></svg>
);

export const FullscreenIcon = (p: P) => (
  <svg {...base(p)}><path d="M21.707 2.293a1 1 0 0 1 0 1.414L17.414 8l1.623 1.623a1 1 0 0 1-1.414 1.414L15 8.414l-2.623-2.623a1 1 0 0 1 1.414-1.414L15.414 6l4.293-4.293a1 1 0 0 1 1.414 0zM8.414 15l-1.623 1.623a1 1 0 0 1-1.414-1.414L7 13.586 2.707 9.293A1 1 0 0 1 2.293 7.707L6.586 12l2.623 2.623A1 1 0 0 1 8.414 15z" /><path d="M3 18h6v3H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zm12 0h6v1a1 1 0 0 1-1 1h-5v-2z" /></svg>
);

export const ExpandIcon = (p: P) => (
  <svg {...base(p)}><path d="M15 3h6v6h-2.5V5.561L11.707 12.354a1 1 0 0 1-1.414-1.414l6.793-6.793H15V3zM2.293 11.293 6.586 15.586l-1.414 1.414L2.293 18v-5.207a1 1 0 0 1 1.5-1.5zM21 15v6h-6v-2.5h3.44l-6.793-6.793a1 1 0 0 1 1.414-1.414l6.793 6.793V15H21z" /></svg>
);

export const MiniPlayerIcon = (p: P) => (
  <svg {...base(p)}><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14zm-7-7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>
);

export const DeviceIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16.5v1.5H4a2.5 2.5 0 0 1-2.5-2.5V4A2.5 2.5 0 0 1 4 1.5h17.5V3H4zm17 6.5a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1h4zm-3 9.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" /></svg>
);

export const GearIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export const ChevronLeftIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
);

export const MoreIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" /></svg>
);

export const FolderIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
);

export const LinkIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m5.156-2.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0" /></svg>
);

export const MusicNoteIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
);

export const CloudIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.5 5.5 0 107.5 10.5 4 4 0 003 15z" /></svg>
);

export const NowPlayingIcon = (p: P) => (
  <svg {...base(p)}><path d="M11 18a1 1 0 1 0 2 0V6a1 1 0 1 0-2 0v12zM6 22a1 1 0 1 0 2 0v-8a1 1 0 1 0-2 0v8zm10-12a1 1 0 1 0 2 0v4a1 1 0 1 0-2 0v-4zM2 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1zm20 0a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" /></svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

export const SpotifyMarkIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.66-.66 13.38 1.561.42.24.539.84.361 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.56.3z" /></svg>
);

// Green circle + white check: Spotify's "added to your library / downloaded" indicator
export const CheckCircleIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zM9.75 15.94 6.5 12.69l1.41-1.41 1.84 1.84 4.34-4.34 1.41 1.41-5.75 5.75z" /></svg>
);

// Notification bell (top-right action icon)
export const BellIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5v3.3L2.6 16.2a.75.75 0 0 0 .6 1.2h4.55a4.25 4.25 0 0 0 8.5 0h4.55a.75.75 0 0 0 .6-1.2l-1.9-3.9V9a7.5 7.5 0 0 0-7.5-7.5zM12 20a2.75 2.75 0 0 1-2.75-2.75h5.5A2.75 2.75 0 0 1 12 20zM6 9a6 6 0 1 1 12 0v3.51l.17.35 1.6 3.29H4.23l1.6-3.3.17-.34V9z" /></svg>
);

// Friend activity (people) top-right action icon
export const FriendsIcon = (p: P) => (
  <svg {...base(p)}><path d="M8.5 7.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0zm3.75-2.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zM2 19.75c0-2.62 2.92-4.75 6.5-4.75h.5a.75.75 0 0 1 0 1.5h-.5c-2.76 0-5 1.55-5 3.25v.5H2v-.5zM22 19.75c0-2.62-2.92-4.75-6.5-4.75h-.5a.75.75 0 0 1 0-1.5h.5c3.58 0 6.5 2.13 6.5 4.75v.5h-1.5v-.5c0-1.7-2.24-3.25-5-3.25h-.5v-1.5h.5c3.58 0 6.5 2.13 6.5 4.75v.5z" /><path d="M15.25 7.25a2.75 2.75 0 0 1 0 5.5 4.75 4.75 0 0 0-2.12-2.7 4.74 4.74 0 0 0 0-4.6 4.74 4.74 0 0 0 2.12 1.8z" /></svg>
);

export const ExternalLinkIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" /></svg>
);
