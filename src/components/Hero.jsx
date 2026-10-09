import { useCallback, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import site from '../config/site';
import { changelog } from '../config/content';
import { useMagnetic, EASE } from '../lib/motion';
import Wordmark from './Wordmark';
import { Dimension, SheetFrame } from './Drafting';
import { sheetNumber, SHEETS } from '../config/sheets';

// If anything in the intro fails (a font that never loads, a tab left in the
// background), the page is handed back after this long regardless.
const INTRO_BUDGET_MS = 8000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------------
   Exploded isometric view of a typical project: the three layers I build,
   pulled apart so each can be labelled. Geometry is computed, not hand-drawn,
   so the three slabs stay true to one projection.
   ------------------------------------------------------------------------ */
const ISO = { w: 104, d: 104, t: 13, gap: 50, cx: 100, cy: 18 };
const LAYERS = [
  { name: 'Interface', note: 'Next.js, React' },
  { name: 'Services', note: 'ASP.NET Core API' },
  { name: 'Data', note: 'SQL Server, PostgreSQL' },
];

const project = (x, y, z, top) => [
  ISO.cx + (x - y) * 0.866,
  top + (x + y) * 0.5 - z,
];
const poly = (pts) => `M${pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z`;

const IsoStack = ({ className = '' }) => {
  const slabs = LAYERS.map((layer, i) => {
    const top = ISO.cy + ISO.t + i * (ISO.t + ISO.gap);
    const { w, d, t } = ISO;
    const P = (x, y, z) => project(x, y, z, top);
    return {
      ...layer,
      topFace: poly([P(0, 0, t), P(w, 0, t), P(w, d, t), P(0, d, t)]),
      leftFace: poly([P(0, d, 0), P(w, d, 0), P(w, d, t), P(0, d, t)]),
      rightFace: poly([P(w, 0, 0), P(w, d, 0), P(w, d, t), P(w, 0, t)]),
      anchor: P(w, 0, t),
      corners: [P(0, d, 0), P(w, d, 0), P(w, 0, 0)],
      cornersTop: [P(0, d, t), P(w, d, t), P(w, 0, t)],
    };
  });

  return (
    <svg viewBox="0 0 400 280" className={className} aria-labelledby="iso-title" role="img">
      <title id="iso-title">Exploded view of a typical project: interface, services and data layers</title>
      <defs>
        <pattern id="iso-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-ink)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* Alignment lines between the slabs, in non-photo blue. */}
      {slabs.slice(0, -1).map((s, i) =>
        s.corners.map((c, k) => {
          const next = slabs[i + 1].cornersTop[k];
          return (
            <line
              key={`${i}-${k}`}
              data-iso-draw
              pathLength="1"
              x1={c[0]}
              y1={c[1]}
              x2={next[0]}
              y2={next[1]}
              stroke="var(--color-cyan)"
              strokeWidth="1"
              strokeDasharray="1"
            />
          );
        })
      )}

      {/* Bottom slab first, so each one above is painted over the one below. */}
      {[...slabs].reverse().map((s) => (
        <g key={s.name}>
          <path data-iso-draw pathLength="1" d={s.leftFace} fill="url(#iso-hatch)" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
          <path data-iso-draw pathLength="1" d={s.rightFace} fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
          <path data-iso-draw pathLength="1" d={s.topFace} fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />

          {/* Leader from the slab's corner out to its note. */}
          <path
            data-iso-draw
            pathLength="1"
            d={`M${s.anchor[0]} ${s.anchor[1]} L${s.anchor[0] + 30} ${s.anchor[1] - 18} H 256`}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1"
          />
          <circle cx={s.anchor[0]} cy={s.anchor[1]} r="2.2" fill="var(--color-ink)" data-iso-fade />
          <g data-iso-fade>
            <text
              x="262"
              y={s.anchor[1] - 20}
              fontSize="15"
              fontWeight="700"
              fill="var(--color-ink)"
              style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              {s.name}
            </text>
            <text x="262" y={s.anchor[1] - 4} fontSize="11.5" fill="var(--color-ink-2)" style={{ fontFamily: 'var(--font-sans)' }}>
              {s.note}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
};

/* ------------------------------------------------------------------------
   The title block: the box in the corner of every drawing that says what it
   is, who drew it and which revision you are looking at.
   ------------------------------------------------------------------------ */
const TitleBlock = () => {
  const rows = [
    { label: 'Drawn by', value: site.name },
    { label: 'Now', value: site.now },
    { label: 'Based in', value: site.location },
    { label: 'Status', value: 'Open to freelance and contract work', status: true },
  ];

  return (
    <dl className="w-full border-[1.5px] border-ink bg-paper text-[14px] md:text-[15px]">
      <div data-intro-row className="px-3 py-3 border-b-[1.5px] border-ink">
        <dt className="sr-only">Title</dt>
        <dd className="font-display font-extrabold text-[26px] leading-none tracking-tight">Portfolio</dd>
      </div>
      {rows.map((row) => (
        <div data-intro-row key={row.label} className="grid grid-cols-[88px_minmax(0,1fr)] border-b border-ink/50">
          <dt className="lettering text-[11px] text-ink-2 px-3 py-2.5 border-r border-ink/50 self-stretch flex items-center">
            {row.label}
          </dt>
          <dd className={`px-3 py-2.5 min-w-0 ${row.status ? 'text-red font-medium flex items-center gap-2' : ''}`}>
            {row.status && (
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inset-0 rounded-full border border-red animate-sweep" />
                <span className="relative h-2 w-2 rounded-full bg-red" />
              </span>
            )}
            {row.value}
          </dd>
        </div>
      ))}
      <div data-intro-row className="grid grid-cols-2">
        <div className="grid grid-cols-[88px_minmax(0,1fr)] border-r border-ink/50">
          <dt className="lettering text-[11px] text-ink-2 px-3 py-2.5 border-r border-ink/50 flex items-center">Sheet</dt>
          <dd className="lettering px-3 py-2.5">
            {sheetNumber('home')} of {String(SHEETS.length).padStart(2, '0')}
          </dd>
        </div>
        <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
          <dt className="lettering text-[11px] text-ink-2 px-3 py-2.5 border-r border-ink/50 flex items-center">Rev</dt>
          <dd className="lettering px-3 py-2.5 text-red">{changelog[0]?.version}</dd>
        </div>
      </div>
    </dl>
  );
};

/* ------------------------------------------------------------------------ */

const Hero = ({ onPreloadComplete }) => {
  const sectionRef = useRef(null);
  const contactRef = useMagnetic(0.3);
  const workRef = useMagnetic(0.3);

  // Held in a ref so a new inline callback from App never replays the intro.
  const onPreloadCompleteRef = useRef(onPreloadComplete);
  useEffect(() => {
    onPreloadCompleteRef.current = onPreloadComplete;
  }, [onPreloadComplete]);

  // The stencil face has to be in before the letters can be measured.
  const fontReady = useMemo(() => {
    const load = document.fonts?.load
      ? document.fonts.load("800 100px 'Big Shoulders Stencil Variable'").catch(() => {})
      : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
    return Promise.race([load, timeout]);
  }, []);

  // Scroll stays locked while the sheet is drafted.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const finishedRef = useRef(false);
  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.body.style.overflow = '';
    onPreloadCompleteRef.current?.();
  }, []);

  const layersRef = useRef(null);

  /** Everything in its final place, no motion. */
  const snapToRest = useCallback(() => {
    const root = sectionRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    gsap.set(q('[data-construct]'), { scaleX: 1, opacity: 0.35 });
    gsap.set(q('[data-intro-dim]'), { scaleX: 1 });
    gsap.set(q('[data-intro-fade], [data-iso], [data-iso-fade]'), { opacity: 1, y: 0 });
    gsap.set(q('[data-iso-draw]'), { strokeDashoffset: 0 });
    gsap.set(q('[data-intro-row]'), { clipPath: 'inset(0px 0px 0% 0px)' });
    (layersRef.current || []).forEach((l) => {
      if (!l) return;
      gsap.set(l.outlineClip, { attr: { width: l.width } });
      gsap.set(l.hatchClip, { attr: { y: l.top, height: l.height } });
      gsap.set(l.solid, { opacity: 1 });
    });
  }, []);

  // Failsafe: the visitor always gets the page.
  useEffect(() => {
    const id = setTimeout(() => {
      if (finishedRef.current) return;
      snapToRest();
      finishIntro();
    }, INTRO_BUDGET_MS);
    return () => clearTimeout(id);
  }, [snapToRest, finishIntro]);

  const ctxRef = useRef(null);
  useEffect(() => () => ctxRef.current?.revert(), []);

  /**
   * The drafting sequence, started once the letters are measured and in the
   * DOM. Construction lines first, then each letter outlined, hatched and
   * inked, then the dimension, the notes and the title block.
   */
  const handleWordmarkReady = useCallback(
    (layers) => {
      layersRef.current = layers;
      if (finishedRef.current) {
        snapToRest();
        return;
      }
      if (prefersReducedMotion()) {
        snapToRest();
        finishIntro();
        return;
      }

      const root = sectionRef.current;
      const q = gsap.utils.selector(root);

      ctxRef.current?.revert();
      ctxRef.current = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: finishIntro });

        tl.to(q('[data-construct]'), { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power2.inOut' }, 0);

        layers.forEach((l, i) => {
          const at = 0.35 + i * 0.12;
          tl.to(l.outlineClip, { attr: { width: l.width }, duration: 0.5, ease: 'power1.inOut' }, at);
          tl.to(l.hatchClip, { attr: { y: l.top, height: l.height }, duration: 0.45, ease: 'power2.out' }, at + 0.5);
          tl.to(l.solid, { opacity: 1, duration: 0.3, ease: 'none' }, at + 1.0);
        });

        tl.to(q('[data-construct]'), { opacity: 0.35, duration: 0.6 }, 1.9);
        tl.to(q('[data-intro-dim]'), { scaleX: 1, duration: 0.7, ease: EASE }, 1.6);
        tl.to(q('[data-intro-fade]'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: EASE }, 1.85);
        tl.to(q('[data-iso]'), { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.7);
        tl.to(q('[data-iso-draw]'), { strokeDashoffset: 0, duration: 1, stagger: 0.025, ease: 'power1.inOut' }, 1.8);
        tl.to(q('[data-iso-fade]'), { opacity: 1, duration: 0.5, stagger: 0.06 }, 2.5);
        tl.to(q('[data-intro-row]'), { clipPath: 'inset(0px 0px 0% 0px)', duration: 0.45, stagger: 0.07, ease: 'power2.out' }, 2.0);
      }, root);
    },
    [finishIntro, snapToRest]
  );

  return (
    <section ref={sectionRef} id="home" className="paper-grid relative overflow-hidden min-h-[100svh]">
      <SheetFrame />

      {/* Initial states for the intro live in inline styles so the first
          paint is already the blank sheet. snapToRest() is the way out. */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-6 pb-12 pt-24 md:px-12 md:pb-14 md:pt-28">
        <div className="grid flex-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <Dimension
              label={site.name}
              data-intro-dim
              className="mb-7 md:mb-9 origin-center text-ink"
              labelClassName="text-[11px] md:text-[13px] text-ink"
              style={{ transform: 'scaleX(0)' }}
            />

            <div className="relative">
              <span
                data-construct
                aria-hidden="true"
                className="absolute -left-[100vw] -right-[100vw] top-0 h-px origin-left bg-cyan"
                style={{ transform: 'scaleX(0)' }}
              />
              <span
                data-construct
                aria-hidden="true"
                className="absolute -left-[100vw] -right-[100vw] bottom-0 h-px origin-left bg-cyan"
                style={{ transform: 'scaleX(0)' }}
              />
              <h1 aria-label={site.name}>
                <Wordmark word={site.wordmark} ready={fontReady} onReady={handleWordmarkReady} />
              </h1>
            </div>

            <div data-intro-fade className="mt-7 md:mt-9" style={{ opacity: 0, transform: 'translateY(24px)' }}>
              <p className="font-display text-[2rem] font-bold leading-none md:text-5xl">{site.role}</p>
              <p className="mt-3 max-w-[42ch] text-base text-ink-2 md:text-lg">{site.roleDetail}</p>
            </div>

            <div data-intro-fade className="mt-8 flex flex-wrap gap-3" style={{ opacity: 0, transform: 'translateY(24px)' }}>
              <a
                ref={contactRef}
                href="#contact"
                className="inline-flex items-center bg-ink px-6 py-3.5 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-red"
              >
                Get in touch
              </a>
              <a
                ref={workRef}
                href="#project"
                className="inline-flex items-center border-[1.5px] border-ink px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                See my work
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 lg:gap-8">
            <div data-iso style={{ opacity: 0, transform: 'translateY(40px)' }}>
              <IsoStack className="block w-full max-w-[400px]" />
            </div>
            <TitleBlock />
          </div>
        </div>
      </div>

      {/* Starting states for the drawing and the title block rows. GSAP's
          inline styles override these as the intro runs. */}
      <style>{`
        #home [data-iso-draw] { stroke-dasharray: 1; stroke-dashoffset: 1; }
        #home [data-iso-fade] { opacity: 0; }
        #home [data-intro-row] { clip-path: inset(0 0 100% 0); }
      `}</style>
    </section>
  );
};

export default Hero;
