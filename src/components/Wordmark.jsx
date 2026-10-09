import React, { forwardRef, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

/**
 * The hero wordmark, drawn as an SVG so it can be drafted in three passes:
 * an outline, a hatch, then solid ink. Each letter is its own <text> with its
 * own clip rectangles, which is what lets the passes run letter by letter.
 *
 * The viewBox is fitted to the ink of the letters, not the font's line box,
 * using canvas text metrics. That makes the top and bottom edges of the SVG
 * the cap line and the baseline exactly, so the construction lines and the
 * dimension line can be laid against its box with plain CSS.
 *
 * The parent drives the animation through the ref: it gets the clip rects and
 * the solid layer for each letter, and decides the timing itself.
 */

const FONT_SIZE = 100;
const FAMILY = "'Big Shoulders Stencil Variable', 'Big Shoulders Variable', 'Arial Narrow', sans-serif";
const WEIGHT = 800;
// A little tracking keeps the A and S of the stencil from touching.
const TRACK = 3;

function measure(word) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${WEIGHT} ${FONT_SIZE}px ${FAMILY}`;

  const whole = ctx.measureText(word);
  const ascent = whole.actualBoundingBoxAscent || FONT_SIZE * 0.72;
  const left = whole.actualBoundingBoxLeft || 0;
  const right = whole.actualBoundingBoxRight || whole.width;

  // Advance of every prefix gives each letter's x, kerning included.
  const letters = Array.from(word).map((char, i) => {
    const x = ctx.measureText(word.slice(0, i)).width + i * TRACK;
    const w = ctx.measureText(char).width;
    return { char, x, w };
  });

  return {
    letters,
    box: { x: -left - 1, y: -ascent - 1, w: left + right + (word.length - 1) * TRACK + 2, h: ascent + 2 },
  };
}

const Wordmark = forwardRef(function Wordmark({ word, className = '', ready, onReady }, ref) {
  const [geo, setGeo] = useState(null);
  const svgRef = useRef(null);
  const layers = useRef([]);
  // Ids for the clip paths, stripped to characters a CSS selector accepts.
  const uid = `wm${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Fonts first, then measure. `ready` resolves when the stencil face is in.
  useLayoutEffect(() => {
    let cancelled = false;
    ready.then(() => {
      if (!cancelled) setGeo(measure(word));
    });
    return () => {
      cancelled = true;
    };
  }, [word, ready]);

  // Tell the parent once the letters exist in the DOM, so it can animate them.
  const onReadyRef = useRef(onReady);
  useLayoutEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  useLayoutEffect(() => {
    if (geo) onReadyRef.current?.(layers.current);
  }, [geo]);

  useImperativeHandle(ref, () => ({
    svg: svgRef.current,
    layers: layers.current,
    geo,
  }), [geo]);

  if (!geo) {
    // Holds the space while the font loads, at roughly the right ratio.
    return <div className={className} style={{ aspectRatio: '2.4 / 1' }} />;
  }

  const { box, letters } = geo;
  const textProps = {
    y: 0,
    fontSize: FONT_SIZE,
    style: { fontFamily: FAMILY, fontWeight: WEIGHT, fontKerning: 'none' },
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      className={`block w-full h-auto overflow-visible ${className}`}
      role="img"
      aria-label={word}
    >
      <defs>
        <pattern id={`${uid}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--color-ink)" strokeWidth="1.1" />
        </pattern>
        {letters.map((l, i) => (
          <React.Fragment key={i}>
            <clipPath id={`${uid}-o${i}`}>
              <rect data-clip="outline" x={l.x - 4} y={box.y} width={0} height={box.h + 2} />
            </clipPath>
            <clipPath id={`${uid}-h${i}`}>
              <rect data-clip="hatch" x={l.x - 4} y={0} width={l.w + 8} height={0} />
            </clipPath>
          </React.Fragment>
        ))}
      </defs>

      {letters.map((l, i) => (
        <g
          key={i}
          ref={(el) => {
            if (!el) return;
            layers.current[i] = {
              outline: el.querySelector('[data-layer="outline"]'),
              hatch: el.querySelector('[data-layer="hatch"]'),
              solid: el.querySelector('[data-layer="solid"]'),
              outlineClip: document.querySelector(`#${uid}-o${i} rect`),
              hatchClip: document.querySelector(`#${uid}-h${i} rect`),
              width: l.w + 8,
              top: box.y,
              height: box.h + 2,
            };
          }}
        >
          <text
            data-layer="outline"
            x={l.x}
            {...textProps}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="0.9"
            clipPath={`url(#${uid}-o${i})`}
          >
            {l.char}
          </text>
          <text data-layer="hatch" x={l.x} {...textProps} fill={`url(#${uid}-hatch)`} clipPath={`url(#${uid}-h${i})`}>
            {l.char}
          </text>
          <text data-layer="solid" x={l.x} {...textProps} fill="var(--color-ink)" opacity="0">
            {l.char}
          </text>
        </g>
      ))}
    </svg>
  );
});

export default Wordmark;
