import { useEffect, useRef, useState } from 'react';

export type MascotMood = 'idle' | 'email' | 'password' | 'success';

/**
 * Mori — MoriPal's original mini mascot. A small pulse-orb whose eyes follow
 * the visitor's cursor, glance at the email field while it is focused, and
 * politely cover their eyes while a password is being typed.
 */
export function LoginMascot({ mood }: { mood: MascotMood }) {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / 320;
      const dy = (e.clientY - cy) / 320;
      const len = Math.hypot(dx, dy) || 1;
      const clamp = Math.min(1, len);
      setLook({ x: (dx / len) * clamp * 5, y: (dy / len) * clamp * 4 });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const covering = mood === 'password';
  const happy = mood === 'success';
  const eyeX = mood === 'email' ? -2.5 : look.x;
  const eyeY = mood === 'email' ? 3 : look.y;

  return (
    <div ref={ref} className={`mascot ${covering ? 'mascot-cover' : ''} ${happy ? 'mascot-happy' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img">
        {/* body */}
        <circle cx="70" cy="72" r="46" className="mascot-body" />
        <circle cx="70" cy="72" r="46" fill="none" stroke="var(--border)" strokeWidth="1.5" />
        {/* pulse line across the body */}
        <path d="M34 88 h14 l6 -12 l8 22 l7 -16 l5 6 h32" fill="none" stroke="var(--primary-foreground)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        {/* eyes */}
        <g className="mascot-eyes" style={{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: 'transform 120ms ease-out' }}>
          {happy ? (
            <>
              <path d="M46 60 q6 -8 12 0" fill="none" stroke="var(--primary-foreground)" strokeWidth="4" strokeLinecap="round" />
              <path d="M82 60 q6 -8 12 0" fill="none" stroke="var(--primary-foreground)" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="52" cy="60" r="9" fill="var(--primary-foreground)" />
              <circle cx="88" cy="60" r="9" fill="var(--primary-foreground)" />
              <circle cx="52" cy="60" r="4" fill="var(--navy)" className="mascot-pupil" />
              <circle cx="88" cy="60" r="4" fill="var(--navy)" className="mascot-pupil" />
            </>
          )}
        </g>
        {/* cheeks */}
        <circle cx="42" cy="76" r="5" fill="var(--primary-foreground)" opacity="0.25" />
        <circle cx="98" cy="76" r="5" fill="var(--primary-foreground)" opacity="0.25" />
        {/* paws — rise to cover the eyes while a password is typed */}
        <g className="mascot-paws">
          <circle cx="50" cy="60" r="12" fill="var(--accent)" stroke="var(--border)" />
          <circle cx="90" cy="60" r="12" fill="var(--accent)" stroke="var(--border)" />
        </g>
      </svg>
      <span className="mascot-shadow" />
    </div>
  );
}
