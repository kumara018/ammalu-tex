export function LogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className}>
      <g transform="rotate(-6 30 30)">
        <ellipse cx="30" cy="30" rx="23" ry="27" stroke="currentColor" strokeWidth="2" />
      </g>
      <text
        x="30" y="42"
        fontFamily="-apple-system,'SF Pro Display','Segoe UI',Helvetica,Arial,sans-serif"
        fontWeight="900" fontSize="27" textAnchor="middle" fill="currentColor"
      >
        A
      </text>
    </svg>
  );
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="text-gold-500 flex-shrink-0" size={34} />
      <div className="hidden sm:block leading-tight">
        <p className="font-bold text-maroon-900 uppercase" style={{ letterSpacing: '0.04em', fontSize: '15px' }}>
          Ammalu Tex
        </p>
        <p className="font-semibold text-maroon-500 uppercase" style={{ letterSpacing: '0.1em', fontSize: '9.5px' }}>
          Premium Women&apos;s Textiles
        </p>
      </div>
    </div>
  );
}
