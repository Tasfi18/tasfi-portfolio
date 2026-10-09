import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useMotion } from '../lib/motion';
import site from '../config/site';
import { changelog, unreleased } from '../config/content';
import { SheetHeader, RevTriangle, RevisionCloud } from './Drafting';

/**
 * How far back a card sits. The card in the reading position is sharp; each
 * step away is a little smaller and fainter, like sheets further down a pile.
 */
const RACK = ['scale-100 opacity-100', 'scale-[0.95] opacity-60', 'scale-[0.9] opacity-35'];

const CARD_W = 'w-[288px] sm:w-[320px] lg:w-[330px]';

const ReleaseCard = ({ entry, rev, rack, isActive, onSelect, wasDragged }) => {
  const current = entry.status === 'Current';

  const handleClick = (event) => {
    if (wasDragged()) return;
    if (!isActive) {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      onClick={handleClick}
      aria-current={isActive ? 'true' : undefined}
      className={`${CARD_W} flex shrink-0 snap-start flex-col border-[1.5px] border-ink bg-paper origin-left transition-[scale,opacity] duration-[350ms] ease-swift ${RACK[rack]} ${
        isActive ? '' : 'cursor-pointer'
      }`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/40 px-5 pb-4 pt-5">
        <div>
          <p className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight">v{entry.version}</p>
          <p className="lettering mt-2 text-[11px] text-ink-2">{entry.period}</p>
        </div>
        <RevTriangle n={rev} className="mt-1 h-7 w-8 shrink-0 text-red" />
      </header>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="font-display text-[1.65rem] font-bold leading-[1.05]">{entry.title}</h3>
        <p className="mt-1.5 font-semibold">{entry.org}</p>
        <p className="mt-0.5 text-[15px] text-ink-2">{entry.place}</p>

        <div className="mt-6">
          <p className="lettering mb-2 text-[11px] text-ink-2">Added</p>
          <ul className="flex flex-col gap-2">
            {entry.added.map((line) => (
              <li key={line} className="flex items-baseline gap-2.5 text-[15px] leading-snug">
                <span aria-hidden="true" className="relative top-[-2px] h-[6px] w-[6px] shrink-0 bg-ink" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="lettering flex items-center justify-between border-t border-ink/40 px-5 py-3 text-[11px]">
        <span className={`relative ${current ? 'text-red' : 'text-ink-2'}`}>
          {entry.status}
          {current && <RevisionCloud bulge={4} strokeWidth={1.1} />}
        </span>
        <span className="text-ink-2">Rev {rev}</span>
      </footer>
    </article>
  );
};

/** Keep a Changelog puts unreleased work first. So does this shelf. */
const UnreleasedCard = ({ rack, isActive }) => (
  <article
    className={`${CARD_W} flex shrink-0 snap-start flex-col border-[1.5px] border-dashed border-ink bg-paper/60 origin-left transition-[scale,opacity] duration-[350ms] ease-swift ${RACK[rack]}`}
  >
    <header className="border-b border-dashed border-ink/50 px-5 pb-4 pt-5">
      <p className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight">Unreleased</p>
      <p className="lettering mt-2 text-[11px] text-ink-2">Next entry</p>
    </header>
    <div className="flex flex-1 flex-col px-5 py-5">
      <h3 className="font-display text-[1.65rem] font-bold leading-[1.05]">{unreleased.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">{unreleased.body}</p>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <a
          href="#contact"
          tabIndex={isActive ? 0 : -1}
          className="inline-flex justify-center bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-red"
        >
          Start a conversation
        </a>
        {site.socials.fiverr && (
          <a
            href={site.socials.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isActive ? 0 : -1}
            className="inline-flex justify-center border-[1.5px] border-ink px-5 py-3 text-[15px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            Hire me on Fiverr
          </a>
        )}
      </div>
    </div>
    <footer className="lettering flex items-center justify-between border-t border-dashed border-ink/50 px-5 py-3 text-[11px] text-ink-2">
      <span>Pencil</span>
      <span>Not yet inked</span>
    </footer>
  </article>
);

const Changelog = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const railRef = useMotion();
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [progress, setProgress] = useState(0);
  const count = changelog.length + 1; // plus the unreleased card

  // Page scroll drives the shelf only on a large pointer screen. On touch,
  // taking over the scroll would fight the visitor's own swipe.
  const scrollDriven = isDesktop && !reducedMotion;

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px) and (min-height: 680px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setIsDesktop(desktop.matches);
      setReducedMotion(reduced.matches);
    };
    update();
    desktop.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  /** The card nearest the track's left edge is the one being read. */
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const edge = track.scrollLeft;
    let nearest = 0;
    let best = Infinity;
    // The last child is the run-off spacer, which is never a reading position.
    Array.from(track.children).slice(0, -1).forEach((child, i) => {
      const d = Math.abs(child.offsetLeft - track.offsetLeft - edge);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    syncActive();
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [syncActive]);

  /**
   * Pin the sheet and map vertical scroll onto the track's scrollLeft. Driving
   * scrollLeft rather than a transform keeps the active-card detection above
   * working unchanged.
   */
  useEffect(() => {
    if (!scrollDriven) return undefined;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return undefined;
    const distance = () => track.scrollWidth - track.clientWidth;
    if (distance() <= 0) return undefined;

    const tween = gsap.to(track, {
      scrollLeft: distance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() * 1.2}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
      },
    });

    const refresh = () => ScrollTrigger.refresh();
    const timer = setTimeout(refresh, 300);
    window.addEventListener('load', refresh);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', refresh);
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'scrollLeft' });
    };
  }, [scrollDriven]);

  const scrollTo = useCallback(
    (index) => {
      const track = trackRef.current;
      if (!track) return;
      const child = track.children[Math.max(0, Math.min(track.children.length - 1, index))];
      if (!child) return;

      // When the page scroll is driving the shelf, move the page instead, or
      // the scrub would immediately pull the track back.
      const st = scrollDriven && ScrollTrigger.getAll().find((t) => t.pin === sectionRef.current);
      if (st) {
        const max = track.scrollWidth - track.clientWidth;
        const ratio = max > 0 ? Math.min(1, (child.offsetLeft - track.offsetLeft) / max) : 0;
        window.scrollTo({ top: st.start + (st.end - st.start) * ratio, behavior: reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion, scrollDriven]
  );

  /* Drag to move the shelf with a mouse or pen. Touch uses native scrolling. */
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    const track = trackRef.current;
    drag.current = { active: true, startX: e.clientX, startScroll: track.scrollLeft, moved: 0 };
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(delta);
    if (drag.current.moved > 4) trackRef.current.setPointerCapture?.(e.pointerId);
    trackRef.current.scrollLeft = drag.current.startScroll - delta;
  };
  const endDrag = (e) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    trackRef.current?.releasePointerCapture?.(e.pointerId);
    if (drag.current.moved > 4) scrollTo(active);
  };
  const wasDragged = () => drag.current.moved > 6;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollTo(active + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollTo(active - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="changelog"
      className={`paper-grid relative w-full overflow-hidden ${scrollDriven ? 'flex h-screen flex-col pt-[68px]' : ''}`}
      style={{ backgroundColor: 'var(--color-paper-2)' }}
    >
      <SheetHeader id="changelog" />

      <div
        className={`mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 md:px-12 lg:flex-row lg:items-stretch lg:gap-10 ${
          scrollDriven ? 'min-h-0 flex-1 items-center py-8' : 'py-20 md:py-24'
        }`}
      >
        {/* Left rail */}
        <div ref={railRef} className="flex w-full shrink-0 flex-col justify-center lg:w-[300px] xl:w-[340px]">
          <h2 className="font-display text-[4.5rem] font-extrabold leading-[0.82] tracking-[-0.01em] sm:text-[5.25rem] lg:text-[4.6rem] xl:text-[5.25rem]">
            Changelog
          </h2>
          <p className="mt-6 max-w-[38ch] text-base text-ink-2 md:text-[17px]">
            Work, study and milestones, newest first. Each one is logged the way I would log a release.
          </p>
          <dl className="mt-8 flex flex-col gap-3 border-t border-ink/40 pt-5 text-[15px]">
            <div className="flex items-center gap-3">
              <dt className="w-8 shrink-0 text-red">
                <RevTriangle n="3" className="h-6 w-7" />
              </dt>
              <dd>Revision number, oldest is 1</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="flex w-8 shrink-0 justify-center text-red">
                <span className="relative block h-2.5 w-5">
                  <RevisionCloud bulge={4} strokeWidth={1.2} />
                </span>
              </dt>
              <dd>Clouded entries are still current</dd>
            </div>
          </dl>
        </div>

        {/* Shelf */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-5">
          <div
            ref={trackRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Changelog entries"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={scrollDriven ? undefined : onPointerDown}
            onPointerMove={scrollDriven ? undefined : onPointerMove}
            onPointerUp={scrollDriven ? undefined : endDrag}
            onPointerCancel={scrollDriven ? undefined : endDrag}
            // py-3/-my-3 leaves room for the revision clouds, which overhang
            // their boxes; overflow-x would otherwise clip them.
            className={`-mr-6 flex items-stretch gap-4 py-3 pr-6 md:-mr-12 md:pr-12 -my-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              scrollDriven ? 'overflow-x-hidden' : 'cursor-grab snap-x snap-mandatory overflow-x-auto active:cursor-grabbing'
            }`}
          >
            <UnreleasedCard rack={Math.min(2, active)} isActive={active === 0} />
            {changelog.map((entry, i) => (
              <ReleaseCard
                key={`${entry.version}-${entry.org}`}
                entry={entry}
                rev={changelog.length - i}
                rack={Math.min(2, Math.abs(i + 1 - active))}
                isActive={active === i + 1}
                onSelect={() => scrollTo(i + 1)}
                wasDragged={wasDragged}
              />
            ))}
            {/* Run-off, so the last card can reach the reading position. */}
            <div aria-hidden="true" className="w-[40vw] shrink-0" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-end gap-[5px]">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    aria-label={i === 0 ? 'Go to unreleased' : `Go to v${changelog[i - 1].version}, ${changelog[i - 1].org}`}
                    className={`w-[2px] transition-[height,background-color] duration-300 ease-swift ${
                      i === Math.min(active, count - 1) ? 'h-5 bg-red' : 'h-2.5 bg-ink/40 hover:bg-ink'
                    }`}
                  />
                ))}
              </div>
              <span className="lettering hidden text-[11px] text-ink-2 sm:inline">
                {scrollDriven ? 'Scroll to read back in time' : 'Drag or swipe to read back in time'}
              </span>
            </div>
            <span className="lettering text-[11px] tabular-nums text-ink-2">
              {Math.min(active, count - 1) + 1} of {count}
            </span>
          </div>

          {scrollDriven && (
            <div aria-hidden="true" className="relative h-px bg-ink/25">
              <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Changelog;
