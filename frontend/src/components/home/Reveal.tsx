'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Content that arrives rather than appears.
 *
 * A translate of a few pixels and an opacity, once, when the element first
 * reaches the viewport. Deliberately small: this page's motion belongs to the
 * canvas behind it, and DOM that also moves competes with the room rather than
 * settling into it.
 *
 * Honours `prefers-reduced-motion` by rendering the finished state
 * immediately — not by animating faster. Someone who asked for less motion
 * asked for none, not for a shorter version of it.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();   // once. Re-animating on scroll-back is a tic.
        }
      },
      { rootMargin: '-40px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
