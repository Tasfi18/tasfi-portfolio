import React, { useRef } from 'react';
import { useMotion, gsap, EASE, DURATION } from '../lib/motion';
import { bio, facts, stackRows } from '../config/content';
import { SheetHeader } from './Drafting';

/**
 * One strip of tape. The track holds the group twice and slides by half its
 * width, so the loop has no seam. It is aria-hidden because it repeats every
 * name; the plain list is rendered once for assistive tech below.
 */
const TapeRow = ({ label, items, duration, reverse }) => {
  const group = [...items, ...items, ...items];
  return (
    <div className="flex items-stretch border-t border-ink/40">
      <span className="lettering flex w-[96px] shrink-0 items-center border-r border-ink/40 pl-6 text-[12px] text-ink-2 md:w-[180px] md:pl-12 md:text-[13px]">
        {label}
      </span>
      <div className="tape min-w-0 flex-1 pt-3" aria-hidden="true">
        <div
          className="tape-track"
          style={{ '--tape-duration': `${duration}s`, '--tape-direction': reverse ? 'reverse' : 'normal' }}
        >
          {[...group, ...group].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 whitespace-nowrap px-4 py-3 text-[15px] font-medium text-ink md:px-5 md:py-4 md:text-[17px]"
            >
              <span className="h-[5px] w-[5px] shrink-0 rounded-full border border-ink" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const bioRef = useRef(null);

  const sectionRef = useMotion(({ desktop }) => {
    const words = bioRef.current.querySelectorAll('.word');
    const marks = bioRef.current.querySelectorAll('.pencil-mark');

    if (desktop) {
      // The bio inks in, word by word, as it scrolls through the middle of the
      // screen: pencil grey to ink. Marked terms get their red underline drawn
      // as the ink reaches them.
      gsap.fromTo(
        words,
        { color: '#A3A9C6' },
        {
          color: '#1F2468',
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: bioRef.current, start: 'top 80%', end: 'bottom 55%', scrub: true },
        }
      );
      marks.forEach((mark) => {
        gsap.fromTo(
          mark,
          { '--mark': 0 },
          {
            '--mark': 1,
            ease: 'none',
            scrollTrigger: { trigger: mark, start: 'top 72%', end: 'top 58%', scrub: true },
          }
        );
      });
    } else {
      // On a phone the paragraph is tall, so a scrubbed fill would leave most
      // of it grey at any moment. It simply arrives, fully legible.
      gsap.from(bioRef.current, {
        y: 20,
        opacity: 0,
        duration: DURATION,
        ease: EASE,
        scrollTrigger: { trigger: bioRef.current, start: 'top 90%', once: true },
      });
    }
  });

  return (
    <section ref={sectionRef} id="about" className="paper-grid relative">
      <SheetHeader id="about" />

      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="min-w-0">
            <h2 className="font-display text-[7.5rem] font-extrabold leading-[0.78] tracking-[-0.01em] sm:text-[10rem] lg:text-[12.5rem]">
              Intro
            </h2>

            <div className="mt-12 md:mt-16">
              <h3 className="lettering mb-3 text-[12px] text-ink-2">General notes</h3>
              <ol className="border-y-[1.5px] border-ink">
                {facts.map((fact, i) => (
                  <li
                    key={fact.label}
                    className="grid grid-cols-[1.75rem_5.5rem_minmax(0,1fr)] gap-x-2 border-b border-ink/25 py-3 last:border-b-0 text-[15px] md:text-base"
                  >
                    <span className="lettering pt-0.5 text-[12px] text-ink-2">{i + 1}.</span>
                    <span className="lettering pt-0.5 text-[12px] text-ink-2">{fact.label}</span>
                    <span>{fact.value}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="min-w-0 lg:pt-4">
            <p
              ref={bioRef}
              lang="en"
              className="max-w-[34ch] text-[1.375rem] leading-[1.5] tracking-[-0.01em] text-ink sm:text-[1.6rem] md:text-[1.9rem] md:leading-[1.42]"
            >
              {bio.map((run, r) => {
                const words = run.text.split(' ').map((w, i) => (
                  <React.Fragment key={i}>
                    <span className="word">{w}</span>
                    {i < run.text.split(' ').length - 1 && ' '}
                  </React.Fragment>
                ));
                return (
                  <React.Fragment key={r}>
                    {run.mark ? <span className="pencil-mark font-medium">{words}</span> : words}
                    {r < bio.length - 1 && ' '}
                  </React.Fragment>
                );
              })}
            </p>
          </div>
        </div>
      </div>

      {/* The stack, as a drawing's schedule of materials. */}
      <div className="border-t-[1.5px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[1400px] items-baseline justify-between gap-4 px-6 py-4 md:px-12">
          <h3 className="lettering text-[13px]">Schedule of materials</h3>
          <span className="text-sm text-ink-2">What I build with</span>
        </div>

        <ul className="sr-only">
          {stackRows.flatMap((row) => row.items).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="border-b-[1.5px] border-ink">
          {stackRows.map((row) => (
            <TapeRow key={row.label} {...row} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
