import { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';

/**
 * Cursor-responsive ambient background: floating gradient blobs plus a faint
 * connected-node network that parallaxes toward the pointer. Decorative only —
 * pointer-events are disabled and reduced-motion users get a static render.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let w = 0;
    let h = 0;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    // Deterministic spread — no randomness at module or render scope.
    const nodes = Array.from({ length: 26 }, (_, i) => ({
      x: (i * 0.617 + 0.07) % 1,
      y: (i * 0.381 + 0.13) % 1,
      depth: 0.3 + ((i * 7) % 10) / 14,
      r: 1.2 + ((i * 5) % 4) * 0.5,
    }));
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / Math.max(1, w);
      pointer.ty = e.clientY / Math.max(1, h);
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--primary').trim() || 'oklch(.55 .175 257)';
    const line = styles.getPropertyValue('--border').trim() || 'oklch(.925 .008 250)';
    let t = 0;
    const draw = () => {
      t += 0.004;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      ctx.clearRect(0, 0, w, h);
      const px = pointer.x - 0.5;
      const py = pointer.y - 0.5;
      const pts = nodes.map((n, i) => ({
        x: n.x * w - px * 40 * n.depth + (reduced ? 0 : Math.sin(t + i) * 6),
        y: n.y * h - py * 40 * n.depth + (reduced ? 0 : Math.cos(t * 0.8 + i * 1.7) * 5),
        r: n.r,
      }));
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]!;
          const b = pts[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            ctx.globalAlpha = 0.35 * (1 - Math.sqrt(d2) / 150);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = primary;
      for (const p of pts) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [theme]);

  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <canvas ref={canvasRef} className="ambient-canvas" />
    </div>
  );
}
