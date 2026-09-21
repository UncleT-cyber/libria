import { CloseIcon, ExpandArrowIcon, DeviceIcon } from './icons';

interface Props {
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function DevicePanel({ onClose, expanded, onToggleExpand }: Props) {
  const devices = [
    { id: 'web', name: 'Web Player', active: true, icon: 'chrome' },
    { id: 'mac', name: 'This Mac', active: false, icon: 'mac' },
  ];

  return (
    <aside className={`${expanded ? 'w-[420px]' : 'w-[350px]'} flex-shrink-0 flex flex-col bg-[#121212] rounded-lg overflow-hidden transition-all duration-200`}>
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-bold text-white text-[16px]">Connect to a device</h2>
        <div className="flex items-center gap-1">
          <button onClick={onToggleExpand} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]" title={expanded ? 'Collapse' : 'Expand'}>
            <ExpandArrowIcon className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#232323]">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {devices.map((d) => (
          <button key={d.id} className={`w-full flex items-center gap-3 p-3 rounded-lg ${d.active ? 'bg-[#232323] text-[#1DB954]' : 'bg-[#1a1a1a] hover:bg-[#232323] text-white'}`}>
            <DeviceIcon className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-bold">{d.name}</div>
              <div className="text-xs text-[#b3b3b3]">{d.active ? 'Current device' : 'Available'}</div>
            </div>
            {d.active && <span className="ml-auto w-2 h-2 bg-[#1DB954] rounded-full" />}
          </button>
        ))}
        <p className="text-xs text-[#6a6a6a] pt-2">Select another device to connect. Libria Connect works on local network.</p>
      </div>
    </aside>
  );
}
