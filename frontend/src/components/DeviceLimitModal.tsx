'use client';
import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { DeviceSession } from '@/types';

interface Props {
  sessions: DeviceSession[];
  loading: boolean;
  onPick: (sessionId: number) => void;
  onClose: () => void;
}

function fmt(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function DeviceLimitModal({ sessions, loading, onPick, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-normal text-maroon-900 mb-1">Too many devices signed in</h3>
        <p className="text-sm text-graphite-faint mb-5">
          You&apos;re signed in on 4 devices already — that&apos;s the max allowed. Choose one to sign out of to continue here.
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sessions.map(s => (
            <button
              key={s.id}
              disabled={loading}
              onClick={() => onPick(s.id)}
              className="w-full flex items-center gap-3 p-3 rounded-sm border border-maroon-200 hover:border-maroon-400 hover:bg-maroon-50 text-left transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center flex-shrink-0">
                {s.device_type === 'mobile'
                  ? <Smartphone size={18} className="text-maroon-700" />
                  : s.device_type === 'tablet'
                  ? <Tablet size={18} className="text-maroon-700" />
                  : <Laptop size={18} className="text-maroon-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-maroon-900 truncate">{s.device_name || 'Unknown device'}</p>
                <p className="text-xs text-graphite-faint truncate">
                  {s.location || 'Unknown location'} · {fmt(s.last_active_at || s.created_at)}
                </p>
              </div>
              <span className="text-xs font-semibold text-red-600 flex-shrink-0 whitespace-nowrap">Sign out</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-graphite-faint hover:text-graphite-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
