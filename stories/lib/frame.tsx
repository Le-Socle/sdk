// Cadres de support pour les stories de graphiques : une slide (1920 × 1080) et un visuel carré
// (1080 × 1080). Les dimensions viennent des jetons (--size-slide-width, --size-slide-height,
// --size-visual) ; le cadre est mis à l'échelle de la largeur disponible pour ne jamais déborder.
// Simple cadre de story : le vrai support de slide arrive avec les archétypes (lot 3).
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Kind = 'slide' | 'visuel';
const px = (v: string) => Number.parseFloat(v) || 0;

export function Frame({ kind, label, children }: { kind: Kind; label: string; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ w: 0, h: 0, scale: 1 });
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const w = px(s.getPropertyValue(kind === 'slide' ? '--size-slide-width' : '--size-visual'));
      const h = px(s.getPropertyValue(kind === 'slide' ? '--size-slide-height' : '--size-visual'));
      const avail = el.parentElement?.clientWidth ?? el.clientWidth;
      setM({ w, h, scale: w ? Math.min(1, avail / w) : 1 });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [kind]);
  return (
    <div className="frame">
      <p className="frame__label">{label}</p>
      <div ref={wrap} className="frame__wrap" style={{ width: m.w * m.scale || undefined, height: m.h * m.scale || undefined }}>
        <div
          className="frame__surface"
          data-frame={kind}
          style={{ width: m.w || undefined, height: m.h || undefined, transform: `scale(${m.scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
