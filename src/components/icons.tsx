import type { SVGProps } from 'react';
import {
  Bell as LucideBell,
  Users as LucideUsers,
  Shuffle as LucideShuffle,
  Repeat as LucideRepeat,
  Heart as LucideHeart,
  Volume2 as LucideVolume,
  VolumeX as LucideVolumeMute,
  Mic2 as LucideMic,
  ListMusic as LucideQueue,
  Monitor as LucideDevice,
  PictureInPicture2 as LucideMini,
  Maximize as LucideFullscreen,
  Search as LucideSearch,
} from 'lucide-react';

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true as const,
  ...props,
});

// Wrap lucide icons - let Tailwind w-* h-* control size via CSS, stroke 1.75 matches Spotify line weight
const lucideWrap = (El: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>, p: P) => {
  const { className, style, ...rest } = p as unknown as { className?: string; style?: React.CSSProperties };
  return <El className={className} strokeWidth={1.75} style={style} {...(rest as object)} />;
};

export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" /></svg>
);

export const HomeOutlineIcon = (p: P) => (
  <svg {...base(p)}><path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33zM4 7.577l8-4.62 8 4.62V20h-4v-6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6H4V7.577z" /></svg>
);

export const SearchIcon = (p: P) => lucideWrap(LucideSearch, p);

export const LibraryIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" /></svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)}><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" /></svg>
);

export const PlayIcon = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
);
export const PauseIcon = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);
export const NextIcon = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h2v16H5zM8 5.5v13l11-6.5z" /></svg>
);
export const PrevIcon = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor"><path d="M17 4h2v16h-2zM16 5.5v13l-11-6.5z" /></svg>
);
export const ShuffleIcon = (p: P) => lucideWrap(LucideShuffle, p);
export const RepeatIcon = (p: P) => lucideWrap(LucideRepeat, p);

export const HeartIcon = (p: P) => lucideWrap(LucideHeart, p);

export const HeartFilledIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm0 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm.75-13a.75.75 0 0 0-1.5 0V12c0 .414.336.75.75.75h3.75a.75.75 0 0 0 0-1.5h-3V7.5z" /></svg>
);

export const MicIcon = (p: P) => lucideWrap(LucideMic, p);
export const QueueIcon = (p: P) => lucideWrap(LucideQueue, p);
export const VolumeIcon = (p: P) => lucideWrap(LucideVolume, p);
export const VolumeMuteIcon = (p: P) => lucideWrap(LucideVolumeMute, p);

export const FullscreenIcon = (p: P) => lucideWrap(LucideFullscreen, p);
export const ExpandIcon = (p: P) => lucideWrap(LucideFullscreen, p);
export const MiniPlayerIcon = (p: P) => lucideWrap(LucideMini, p);
export const DeviceIcon = (p: P) => lucideWrap(LucideDevice, p);

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

// Top-right action icons - lucide with 1.75 stroke, matches Spotify line weight
export const BellIcon = (p: P) => lucideWrap(LucideBell, p);
export const FriendsIcon = (p: P) => lucideWrap(LucideUsers, p);

export const ExternalLinkIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" /></svg>
);

// Spotify browse / show-library panel icon (rectangle with right-pane line)
export const BrowseIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 8h4M15 12h4M15 16h4" /></svg>
);
export const SidebarRightIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M15 3v18" /></svg>
);
export const ListSortIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 6h12M3 12h9M3 18h6" /><path d="M17 8l3 3-3 3M17 16l3 3-3 3" /></svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a2.5 2.5 0 0 0-2.45 2.04L5 8l-2.2 2.2a.5.5 0 0 0 .7.7L6 8.5V13a1 1 0 0 0 2 0V8.5l2.5 2.5a.5.5 0 0 0 .7-.7L9 8l-.55-5.96A2.5 2.5 0 0 0 8 0z" /></svg>
);
export const ExpandArrowIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
);
