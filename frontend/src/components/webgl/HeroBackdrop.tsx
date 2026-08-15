'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SilkBackdrop = dynamic(() => import('./SilkBackdrop'), { ssr: false });

/**
 * Ammalu Tex — "Pearl Rose", pitched light.
 *
 * The pale end of the terracotta scale, not gold-500/700: the hero headline is
 * maroon-900 over this panel and has to stay readable, so saturated rose lives
 * only in the fold shadows via the shader's height ramp.
 */
const AMMALU_SILK = {
  deep:  '#dcb3a4',  // dusty terracotta — deepest fold shadows
  mid:   '#f2ded6',  // warm blush — the body of the cloth
  light: '#fdf7f4',  // near-white crests catching the light
  sheen: '#ffe6d4',  // warm specular, from the gold accent scale
};

/**
 * The hero's background layer: flowing WebGL silk when the device can render
 * it, otherwise the original CSS diagonal gradient — byte-identical to what
 * shipped before, so no device gets a *worse* hero than it had.
 */
export default function HeroBackdrop() {
  const [mode, setMode] = useState<'checking' | 'webgl' | 'css'>('checking');

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setMode(gl ? 'webgl' : 'css');
    } catch {
      setMode('css');
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Always painted: the original gradient. It's the fallback on its own,
          and underneath the silk it guarantees the section never flashes
          transparent while the WebGL chunk is still loading. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, #f6ece9 0%, #f6ece9 46%, rgba(179,115,95,0.18) 46.4%, #eeddd8 100%)',
        }}
      />
      {mode === 'webgl' && (
        // This hero mirrors Vijey's: brand mark on the right, copy on the left,
        // so the cloth has to thin toward the left instead.
        <SilkBackdrop
          palette={AMMALU_SILK}
          opacity={0.92}
          copySide="left"
          onFail={() => setMode('css')}
        />
      )}
    </div>
  );
}
