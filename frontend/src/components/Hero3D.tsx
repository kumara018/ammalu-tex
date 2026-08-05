'use client';

/**
 * CSS 3D "cascading ribbon-drape" moment — five layered panels swaying
 * independently with real perspective/rotateY/rotateZ depth, no WebGL.
 * Matches the approved mockup exactly.
 */
const RIBBONS = [
  { top: '0%',   left: '8%',  width: '88%', anim: 'ribbonSway1 6s',   delay: '0s' },
  { top: '19%',  left: '0%',  width: '72%', anim: 'ribbonSway2 7s',   delay: '0.3s' },
  { top: '38%',  left: '20%', width: '80%', anim: 'ribbonSway1 6.6s', delay: '0.6s' },
  { top: '57%',  left: '4%',  width: '64%', anim: 'ribbonSway2 7.4s', delay: '0.9s' },
  { top: '76%',  left: '24%', width: '70%', anim: 'ribbonSway1 6.2s', delay: '1.2s' },
];

export default function Hero3D() {
  return (
    <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
      {RIBBONS.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            top: r.top, left: r.left, width: r.width, height: '15%',
            background: 'linear-gradient(100deg, #c1876f 0%, #eeddd8 80%)',
            border: '1px solid rgba(179,115,95,0.5)',
            boxShadow: '0 30px 60px -24px rgba(0,0,0,0.35)',
            transformStyle: 'preserve-3d',
            animation: `${r.anim} ease-in-out infinite`,
            animationDelay: r.delay,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes ribbonSway1 { 0%,100% { transform: rotateZ(-6deg) rotateY(10deg) translateX(0); } 50% { transform: rotateZ(3deg) rotateY(-8deg) translateX(10px); } }
        @keyframes ribbonSway2 { 0%,100% { transform: rotateZ(5deg) rotateY(-10deg) translateX(0); } 50% { transform: rotateZ(-4deg) rotateY(8deg) translateX(-10px); } }
        @media (prefers-reduced-motion: reduce) {
          div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
