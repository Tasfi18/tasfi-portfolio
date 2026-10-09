import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Build the stack.
 *
 * A layer slides back and forth above the stack. Drop it, and only the part
 * that lands on the layer below stays; the overhang is cut off and falls away.
 * Land it within a few pixels and it snaps exactly into place. Miss entirely
 * and the stack is finished.
 *
 * Drawn on a canvas in the site's drafting language: the moving layer is a
 * pencil outline, it is inked when it lands, and cut-offs are hatched in red.
 *
 * When the panel first scrolls into view it plays itself, attract-mode style.
 * The first click, tap or key press hands it to the visitor on a fresh stack.
 */

const GRAVITY = 1900; // px/s², for falling cut-offs
const EXACT = 4; // px; a drop this close snaps into place
const BEST_KEY = 'tasfi.stack.best';

const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeBest = (n) => {
  try {
    window.localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* storage can be unavailable; the best score then lasts for the visit */
  }
};

const css = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const StackGame = ({ layers, className = '' }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const [hud, setHud] = useState({ level: 0, best: 0, mode: 'attract' });
  const [status, setStatus] = useState('');

  /* ------------------------------------------------------------ the world */

  const labelFor = useCallback((i) => layers[i % layers.length], [layers]);

  const spawn = useCallback(() => {
    const e = engine.current;
    const top = e.stack[e.stack.length - 1];
    const level = e.stack.length;
    const fromLeft = level % 2 === 1;
    e.moving = {
      x: fromLeft ? -top.w * 0.4 : e.W - top.w * 0.6,
      w: top.w,
      dir: fromLeft ? 1 : -1,
      speed: Math.min(520, 150 + level * 14) * (e.W / 900 + 0.5),
      label: labelFor(level),
    };
    // The demo player aims for a small, varying error so trimming shows.
    e.aiTarget = top.x + (Math.random() < 0.6 ? 0 : (Math.random() - 0.5) * top.w * 0.25);
  }, [labelFor]);

  const reset = useCallback(
    (mode) => {
      const e = engine.current;
      if (!e) return;
      const { W, H } = e;
      const h = Math.round(Math.min(34, Math.max(22, H / 13)));
      const baseW = Math.min(300, W * 0.52);
      e.blockH = h;
      e.groundY = H - Math.max(84, H * 0.2);
      e.stack = [{ x: (W - baseW) / 2, w: baseW, label: labelFor(0) }];
      e.debris = [];
      e.flashes = [];
      e.cam = 0;
      e.mode = mode;
      e.aiMiss = 0;
      spawn();
      setHud((s) => ({ ...s, level: 0, mode }));
    },
    [spawn, labelFor]
  );

  const drop = useCallback(() => {
    const e = engine.current;
    const m = e.moving;
    if (!m) return;
    const top = e.stack[e.stack.length - 1];
    const left = Math.max(m.x, top.x);
    const right = Math.min(m.x + m.w, top.x + top.w);
    const overlap = right - left;
    const y = e.groundY - (e.stack.length + 1) * e.blockH;

    if (overlap <= 2) {
      // Missed: the whole layer falls and the run is over.
      e.debris.push({ x: m.x, y, w: m.w, vy: 0, vx: m.dir * 40, rot: 0, vr: m.dir * 1.6 });
      e.moving = null;
      if (e.mode === 'playing') {
        const level = e.stack.length - 1;
        e.mode = 'over';
        if (level > e.best) {
          e.best = level;
          writeBest(level);
        }
        setHud({ level, best: e.best, mode: 'over' });
        setStatus(`The stack is finished at level ${level}. Press space or tap to build again.`);
      } else {
        e.restartAt = e.t + 1.2;
      }
      return;
    }

    if (Math.abs(m.x - top.x) <= EXACT) {
      e.stack.push({ x: top.x, w: top.w, label: m.label });
      e.flashes.push({ x: top.x + top.w / 2, y, t: 0, text: 'Exact' });
    } else {
      e.stack.push({ x: left, w: overlap, label: m.label });
      const cutX = m.x < top.x ? m.x : right;
      const cutW = m.w - overlap;
      e.debris.push({ x: cutX, y, w: cutW, vy: 0, vx: (m.x < top.x ? -1 : 1) * 60, rot: 0, vr: (m.x < top.x ? -1 : 1) * 2.4 });
    }

    const level = e.stack.length - 1;
    if (e.mode === 'playing') setHud((s) => ({ ...s, level }));
    else if (level >= 14) e.restartAt = e.t + 1.4; // demo builds a tidy tower, then starts over
    spawn();
    if (e.restartAt) e.moving = null;
  }, [spawn]);

  /* -------------------------------------------------------------- drawing */

  const draw = useCallback(() => {
    const e = engine.current;
    const ctx = e.ctx;
    const { W, H, blockH: h } = e;
    const ink = e.colors.ink;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, e.cam);

    // Ground, with earth hatching below it as in a section drawing.
    const gy = e.groundY;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, gy, W, 400);
    ctx.clip();
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    for (let x = -400; x < W + 400; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + 40, gy + 40);
      ctx.stroke();
    }
    ctx.restore();

    const font = `600 ${Math.round(h * 0.46)}px 'Big Shoulders Variable', 'Arial Narrow', sans-serif`;
    const drawLabel = (text, x, y, w, color) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y, w - 4, h);
      ctx.clip();
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.toUpperCase(), x + w / 2, y + h / 2 + 1);
      ctx.restore();
    };

    // The stack: the base filled, the rest inked outlines.
    e.stack.forEach((b, i) => {
      const y = gy - (i + 1) * h;
      ctx.fillStyle = i === 0 ? ink : e.colors.paper;
      ctx.fillRect(b.x, y, b.w, h);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.strokeRect(b.x + 0.75, y + 0.75, b.w - 1.5, h - 1.5);
      drawLabel(b.label, b.x, y, b.w, i === 0 ? e.colors.paper : ink);
    });

    // Height of the stack as a dimension line on the right.
    const levels = e.stack.length - 1;
    if (levels > 0) {
      const dx = Math.min(W - 26, Math.max(...e.stack.map((b) => b.x + b.w)) + 28);
      const y0 = gy - h;
      const y1 = gy - (levels + 1) * h;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx, y0);
      ctx.lineTo(dx, y1);
      [y0, y1].forEach((yy) => {
        ctx.moveTo(dx - 6, yy + 6);
        ctx.lineTo(dx + 6, yy - 6);
      });
      ctx.stroke();
      ctx.save();
      ctx.translate(dx + 12, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = ink;
      ctx.font = `600 12px 'Big Shoulders Variable', 'Arial Narrow', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${levels} ${levels === 1 ? 'LAYER' : 'LAYERS'}`, 0, 0);
      ctx.restore();
    }

    // The layer in hand: a pencil outline, not yet inked.
    const m = e.moving;
    if (m) {
      const y = gy - (e.stack.length + 1) * h;
      ctx.fillStyle = e.colors.paperFill;
      ctx.fillRect(m.x, y, m.w, h);
      ctx.strokeStyle = e.colors.cyan;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(m.x + 0.75, y + 0.75, m.w - 1.5, h - 1.5);
      ctx.setLineDash([]);
      drawLabel(m.label, m.x, y, m.w, e.colors.ink2);
    }

    // Cut-offs, hatched in red pencil.
    e.debris.forEach((d) => {
      ctx.save();
      ctx.translate(d.x + d.w / 2, d.y + h / 2);
      ctx.rotate(d.rot);
      ctx.strokeStyle = e.colors.red;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(-d.w / 2, -h / 2, d.w, h);
      ctx.beginPath();
      ctx.rect(-d.w / 2, -h / 2, d.w, h);
      ctx.clip();
      ctx.lineWidth = 1;
      for (let x = -d.w / 2 - h; x < d.w / 2; x += 7) {
        ctx.moveTo(x, h / 2);
        ctx.lineTo(x + h, -h / 2);
      }
      ctx.stroke();
      ctx.restore();
    });

    // "Exact" notes, drifting up and fading.
    e.flashes.forEach((f) => {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 0.9);
      ctx.fillStyle = e.colors.red;
      ctx.font = `700 14px 'Big Shoulders Variable', 'Arial Narrow', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(f.text.toUpperCase(), f.x, f.y - 10 - f.t * 30);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, []);

  /* ----------------------------------------------------------------- loop */

  const step = useCallback(
    (dt) => {
      const e = engine.current;
      e.t += dt;

      if (e.restartAt && e.t >= e.restartAt) {
        e.restartAt = 0;
        reset(e.mode);
      }

      const m = e.moving;
      if (m) {
        m.x += m.dir * m.speed * dt;
        const minX = -m.w * 0.45;
        const maxX = e.W - m.w * 0.55;
        if (m.x < minX) {
          m.x = minX;
          m.dir = 1;
        } else if (m.x > maxX) {
          m.x = maxX;
          m.dir = -1;
        }
        // The demo player drops when it reaches its aim.
        if (e.mode === 'attract' && Math.abs(m.x - e.aiTarget) < m.speed * dt * 0.6 + 0.5) drop();
      }

      e.debris.forEach((d) => {
        d.vy += GRAVITY * dt;
        d.y += d.vy * dt;
        d.x += d.vx * dt;
        d.rot += d.vr * dt;
      });
      e.debris = e.debris.filter((d) => d.y + e.cam < e.H + 80);
      e.flashes.forEach((f) => (f.t += dt));
      e.flashes = e.flashes.filter((f) => f.t < 0.9);

      // Keep the top of the stack around the middle of the panel.
      const top = e.groundY - (e.stack.length + 1) * e.blockH;
      const want = Math.max(0, e.H * 0.42 - top);
      e.cam += (want - e.cam) * Math.min(1, dt * 4);
    },
    [drop, reset]
  );

  /* ---------------------------------------------------------------- input */

  const act = useCallback(() => {
    const e = engine.current;
    if (!e) return;
    if (e.mode === 'attract' || e.mode === 'over' || e.mode === 'idle') {
      e.restartAt = 0;
      reset('playing');
      setStatus('Playing. Press space or tap to drop each layer.');
      if (!e.running) e.start?.();
      return;
    }
    drop();
  }, [drop, reset]);

  const onKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      act();
    }
  };

  /* ---------------------------------------------------------- set up, run */

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();

    engine.current = {
      ctx,
      t: 0,
      W: 0,
      H: 0,
      best: readBest(),
      mode: reduced ? 'idle' : 'attract',
      running: false,
      colors: {
        ink: css('--color-ink', '#1F2468'),
        ink2: css('--color-ink-2', '#474D86'),
        paper: css('--color-paper', '#ECEFF3'),
        paperFill: 'rgba(236, 239, 243, 0.85)',
        cyan: css('--color-cyan', '#4AA3D3'),
        red: css('--color-red', '#D63F2A'),
      },
    };
    const e = engine.current;
    setHud((s) => ({ ...s, best: e.best, mode: e.mode }));

    const size = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      e.W = r.width;
      e.H = r.height;
      reset(e.mode === 'playing' ? 'playing' : e.mode);
      if (e.mode === 'idle') e.moving = null;
      draw();
    };

    let raf = 0;
    let last = 0;
    let visible = false;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    e.start = () => {
      if (e.running || !visible) return;
      e.running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    e.stop = () => {
      e.running = false;
      cancelAnimationFrame(raf);
    };

    // Run only while on screen; and in reduced motion, only once asked to.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && (e.mode !== 'idle' || !reduced)) e.start();
      else if (!visible) e.stop();
    });
    io.observe(wrap);

    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    document.fonts?.ready.then(draw);
    size();

    return () => {
      e.stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [draw, reset, step]);

  const { level, best, mode } = hud;

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label="Build the stack. Press space or Enter to start, then to drop each layer."
        aria-describedby="stack-status"
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          if (event.button === 0) act();
        }}
        className="paper-grid relative aspect-[4/5] w-full cursor-pointer touch-manipulation select-none border-[1.5px] border-ink sm:aspect-[4/3] lg:aspect-[16/9]"
      >
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        <div className="lettering pointer-events-none absolute left-0 right-0 top-0 flex items-stretch border-b border-ink/60 bg-paper/85 text-[12px]">
          <span className="border-r border-ink/60 px-3 py-2">
            Level <span className="tabular-nums">{String(level).padStart(2, '0')}</span>
          </span>
          <span className="border-r border-ink/60 px-3 py-2 text-ink-2">
            Best <span className="tabular-nums">{String(best).padStart(2, '0')}</span>
          </span>
          <span className={`ml-auto px-3 py-2 ${mode === 'playing' ? 'text-red' : 'text-ink-2'}`}>
            {mode === 'playing' ? 'Your turn' : mode === 'over' ? 'Finished' : 'Demo'}
          </span>
        </div>

        {mode !== 'playing' && (
          <div className="pointer-events-none absolute inset-x-0 top-[38px] flex justify-center p-4 md:p-6">
            <span className="bg-ink px-5 py-3 text-[15px] font-semibold text-paper">
              {mode === 'over' ? `Finished at level ${level}. Tap or press space to build again` : 'Tap or press space to play'}
            </span>
          </div>
        )}
      </div>
      <p id="stack-status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
};

export default StackGame;
