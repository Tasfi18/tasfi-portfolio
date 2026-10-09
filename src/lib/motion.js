/* ---------------------------------------------------------------------------
   The site's motion layer.

   One place registers ScrollTrigger, one place owns the easing and duration
   vocabulary, and one hook drives the scroll reveals for every section. Markup
   opts in declaratively:

     <p data-reveal>            fades and rises when it scrolls into view
     <p data-reveal="left">     ... from the left ("right" / "scale" also work)
     <p data-reveal-delay="0.2">delays the start, in seconds
     <ul data-reveal-group>     staggers its own direct children
     <h2 data-reveal-lines>     wipes each line up from behind a mask
     <img data-parallax="40">   drifts 40px against the scroll, scrubbed
     <a data-magnetic="0.3">    leans toward the cursor while hovered

   Every animation is transform + opacity only, so it runs on the compositor,
   and the whole set is skipped for visitors who ask for reduced motion.
   --------------------------------------------------------------------------- */

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const EASE = 'power3.out';
export const DURATION = 0.9;

// Reveals start once the element is a little way into the viewport, so motion
// reads as a response to scrolling rather than something already finished.
const START = 'top 88%';

const OFFSETS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: -48 },
  right: { x: 48 },
  scale: { scale: 0.94 },
  fade: {},
};

// Late-arriving images and webfonts change the page height, which invalidates
// every trigger position measured before they landed. Re-measure once both are
// settled, otherwise a reveal further down the page can end up waiting on a
// scroll position that no longer exists.
if (typeof window !== 'undefined') {
  const refresh = () => ScrollTrigger.refresh();

  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });

  document.fonts?.ready.then(refresh);
}

/**
 * Wire up the declarative reveals inside one section.
 *
 * @param {(context: { scope: HTMLElement, desktop: boolean, mobile: boolean })
 *          => (void | (() => void))} [setup]
 *        Optional extra GSAP work for this section. Anything created inside it
 *        is scoped and reverted with the rest; return a function to clean up
 *        anything GSAP does not own, such as a DOM listener.
 * @param {unknown[]} [deps] Re-run the setup when these change.
 * @returns {import('react').RefObject<HTMLElement>} Attach to the section root.
 */
export function useMotion(setup, deps = []) {
  const scope = useRef(null);

  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;

    // matchMedia gives us the reduced-motion opt-out for free: when the query
    // stops matching, GSAP reverts everything it created inside it.
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 768px)',
      },
      (context) => {
        const { motion, desktop } = context.conditions;
        if (!motion) return;

        revealElements(root);
        revealGroups(root);
        revealLines(root);
        applyParallax(root);

        // Magnetic controls attach real DOM listeners, so unlike the tween-only
        // helpers above they hand back a teardown. It is collected here rather
        // than returned directly because the section's own setup may have one
        // too, and matchMedia will only call whatever this block returns once.
        const cleanups = [applyMagnetic(root)];

        // Sections that need to behave differently on a phone get told which
        // side of the breakpoint they are on, and GSAP re-runs this whole
        // block (reverting the old one) if the viewport crosses it.
        //
        // Returning the setup's own return value hands its cleanup to
        // matchMedia: GSAP reverts the tweens it created, but anything a
        // section wired up by hand — a DOM listener, a timer — has to undo
        // itself, and this is where it gets the chance.
        cleanups.push(setup?.({ scope: root, desktop, mobile: !desktop }));

        return () => cleanups.forEach((fn) => fn?.());
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

/* ---------------------------------------------------------------------------
   Magnetic hover.

   The element leans toward the cursor while it is over it, then springs back
   when the cursor leaves. It is the cheapest way to make a control feel alive —
   the target appears to want to be clicked.

   Two front doors onto one implementation: `data-magnetic="0.3"` in the markup
   for anything inside a section that already calls useMotion, and useMagnetic()
   for a component that does not have a motion scope of its own (the hero, which
   runs its own timeline). Before this they were two separate copies that had
   already drifted apart in duration and release behaviour.
   --------------------------------------------------------------------------- */

// Following a pointer only means anything where there is a pointer to follow.
// On a touch screen the handler fires once on tap and leaves the control
// sitting off-centre, so the whole thing is gated rather than degraded.
const MAGNETIC = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/**
 * Bind one element to the cursor.
 * @returns {() => void} Teardown: drops the listeners and resets the transform.
 */
function magnetise(el, strength) {
  // `quickTo` rather than a fresh tween per pointer event: it reuses one tween
  // and just retargets it, which is what keeps a handler firing at pointer rate
  // off the main thread's back.
  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE });

  const follow = (event) => {
    const box = el.getBoundingClientRect();
    xTo((event.clientX - (box.left + box.width / 2)) * strength);
    yTo((event.clientY - (box.top + box.height / 2)) * strength);
  };

  // Elastic on the way back only. Leaning follows the cursor exactly, but
  // letting go should overshoot — that is the half that reads as springy.
  const release = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
  };

  el.addEventListener('pointermove', follow);
  el.addEventListener('pointerleave', release);
  // A control can also be left by tabbing out of it, which fires no pointer
  // event at all and would otherwise strand it off-centre.
  el.addEventListener('blur', release);

  return () => {
    el.removeEventListener('pointermove', follow);
    el.removeEventListener('pointerleave', release);
    el.removeEventListener('blur', release);
    gsap.killTweensOf(el);
    gsap.set(el, { x: 0, y: 0 });
  };
}

function applyMagnetic(root) {
  if (!window.matchMedia(MAGNETIC).matches) return undefined;

  const undo = gsap.utils
    .toArray('[data-magnetic]', root)
    .map((el) => magnetise(el, parseFloat(el.dataset.magnetic) || 0.3));

  return () => undo.forEach((fn) => fn());
}

/**
 * Magnetic hover for a component that owns no motion scope.
 *
 * @param {number} [strength] How far it leans, as a fraction of the cursor's
 *        distance from its centre. Past ~0.5 it stops reading as a lean and
 *        starts reading as a drag.
 * @returns {import('react').RefObject<HTMLElement>} Attach to the control.
 */
export function useMagnetic(strength = 0.4) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(MAGNETIC).matches) return;
    return magnetise(el, strength);
  }, [strength]);

  return ref;
}

function revealElements(root) {
  gsap.utils.toArray('[data-reveal]', root).forEach((el) => {
    const from = OFFSETS[el.dataset.reveal] ?? OFFSETS.up;

    gsap.from(el, {
      ...from,
      opacity: 0,
      duration: DURATION,
      delay: parseFloat(el.dataset.revealDelay) || 0,
      ease: EASE,
      scrollTrigger: { trigger: el, start: START, once: true },
    });
  });
}

function revealGroups(root) {
  gsap.utils.toArray('[data-reveal-group]', root).forEach((group) => {
    const children = gsap.utils.toArray(':scope > *', group);
    if (!children.length) return;

    gsap.from(children, {
      y: 32,
      opacity: 0,
      duration: DURATION,
      ease: EASE,
      stagger: parseFloat(group.dataset.revealGroup) || 0.08,
      scrollTrigger: { trigger: group, start: START, once: true },
    });
  });
}

// A line wipe needs a mask per line, so the markup wraps each one:
//   <span class="block overflow-hidden"><span class="line">WHAT WE</span></span>
function revealLines(root) {
  gsap.utils.toArray('[data-reveal-lines]', root).forEach((el) => {
    const lines = gsap.utils.toArray('.line', el);
    if (!lines.length) return;

    gsap.from(lines, {
      yPercent: 110,
      duration: 1.1,
      ease: EASE,
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

function applyParallax(root) {
  gsap.utils.toArray('[data-parallax]', root).forEach((el) => {
    const distance = parseFloat(el.dataset.parallax) || 40;

    gsap.fromTo(
      el,
      { yPercent: -distance / 10 },
      {
        yPercent: distance / 10,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-frame]') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}
