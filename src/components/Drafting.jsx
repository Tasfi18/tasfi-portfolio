import { useLayoutEffect, useRef, useState } from 'react';
import { SHEETS, sheetNumber } from '../config/sheets';

/*
 * Small drawing-sheet primitives shared by every section.
 */

/**
 * The strip across the top of each sheet: its number in a filled box, its
 * title, and the count of the set on the right.
 */
export const SheetHeader = ({ id, title, tone = 'paper' }) => {
  const n = sheetNumber(id);
  const ink = tone === 'blueprint' ? 'border-chalk/50 text-chalk' : 'border-ink/70 text-ink';
  const fill = tone === 'blueprint' ? 'bg-chalk text-cyano' : 'bg-ink text-paper';

  return (
    <div className={`lettering relative z-10 flex items-stretch border-y text-[13px] md:text-sm ${ink}`}>
      <span className={`px-3 md:px-4 py-2 ${fill}`}>{n}</span>
      <span className="px-3 md:px-4 py-2">{title ?? SHEETS.find((s) => s.id === id)?.label}</span>
      <span className={`ml-auto px-3 md:px-4 py-2 border-l ${ink}`}>
        Sheet {n} of {String(SHEETS.length).padStart(2, '0')}
      </span>
    </div>
  );
};

/** A dimension line with oblique ticks, extension lines and a centred label. */
export const Dimension = ({ label, className = '', labelClassName = '', style, ...rest }) => (
  <div className={`dim ${className}`} style={style} {...rest}>
    <i />
    <i />
    {label && <span className={`dim-label lettering ${labelClassName}`}>{label}</span>}
  </div>
);

/** A revision triangle with its number, as drawn beside a changed note. */
export const RevTriangle = ({ n, className = '' }) => (
  <svg viewBox="0 0 28 24" className={className} aria-hidden="true">
    <path d="M14 1.5 L26.5 22.5 H1.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <text
      x="14"
      y="19"
      textAnchor="middle"
      fontSize="11"
      fontWeight="700"
      fill="currentColor"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {n}
    </text>
  </svg>
);

/**
 * A revision cloud: the scalloped outline a reviewer draws around something
 * that changed. It measures the box it is placed in and lays an even number of
 * arcs along each side, so it fits any size.
 */
export const RevisionCloud = ({ className = '', bulge = 9, strokeWidth = 1.5 }) => {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return undefined;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = bulge;
  const w = box.w + pad * 2;
  const h = box.h + pad * 2;
  let d = '';

  if (box.w > 0) {
    const side = (len) => Math.max(1, Math.round(len / (bulge * 2.2)));
    const arcs = (x0, y0, x1, y1, count) => {
      let out = '';
      for (let i = 1; i <= count; i++) {
        const x = x0 + ((x1 - x0) * i) / count;
        const y = y0 + ((y1 - y0) * i) / count;
        const r = Math.hypot(x1 - x0, y1 - y0) / count / 2;
        out += ` A ${r} ${r * 1.15} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return out;
    };
    const s = strokeWidth;
    d =
      `M ${s} ${s}` +
      arcs(s, s, w - s, s, side(w)) +
      arcs(w - s, s, w - s, h - s, side(h)) +
      arcs(w - s, h - s, s, h - s, side(w)) +
      arcs(s, h - s, s, s, side(h));
  }

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute overflow-visible ${className}`}
      style={{ left: -pad, top: -pad, width: w, height: h }}
      viewBox={`0 0 ${Math.max(w, 1)} ${Math.max(h, 1)}`}
    >
      {d && <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />}
    </svg>
  );
};

/**
 * The border of a drawing sheet, with grid references in the margin: numbers
 * along the bottom, letters up the sides. They let anyone point at a spot on
 * the sheet ("see C4").
 */
export const SheetFrame = ({ cols = 6, rows = 4, className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none absolute inset-2.5 md:inset-4 z-0 ${className}`}>
    <div className="absolute inset-0 border border-ink/35" />
    <div className="absolute left-4 right-4 md:left-5 md:right-5 -bottom-px flex translate-y-full">
      {Array.from({ length: cols }, (_, i) => (
        <span
          key={i}
          className="lettering flex-1 text-center text-[9px] md:text-[10px] leading-[10px] md:leading-4 text-ink/50 border-l border-ink/25 first:border-l-0"
        >
          {i + 1}
        </span>
      ))}
    </div>
    {['left', 'right'].map((side) => (
      <div
        key={side}
        className={`absolute top-24 bottom-4 flex flex-col ${
          side === 'left' ? '-left-px -translate-x-full' : '-right-px translate-x-full'
        }`}
      >
        {Array.from({ length: rows }, (_, i) => (
          <span
            key={i}
            className="lettering flex flex-1 w-2.5 md:w-4 items-center justify-center text-[9px] md:text-[10px] text-ink/50 border-t border-ink/25 first:border-t-0"
          >
            {String.fromCharCode(65 + i)}
          </span>
        ))}
      </div>
    ))}
  </div>
);
