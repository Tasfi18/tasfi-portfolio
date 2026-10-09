import { useState } from 'react';
import { useMotion, gsap, EASE } from '../lib/motion';
import { services } from '../config/content';
import { SheetHeader } from './Drafting';

/** A plus drawn with two strokes; the vertical one folds away when open. */
const Toggle = ({ open }) => (
  <span aria-hidden="true" className="relative block h-6 w-6 md:h-8 md:w-8">
    <span className="absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-current" />
    <span
      className={`absolute bottom-0 left-1/2 top-0 w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-500 ease-spring motion-reduce:transition-none ${
        open ? 'scale-y-0' : 'scale-y-100'
      }`}
    />
  </span>
);

const Services = () => {
  const [openIndex, setOpenIndex] = useState(0);

  // The rows are laid down one after another the first time the table
  // scrolls into view.
  const sectionRef = useMotion(({ scope }) => {
    const rows = gsap.utils.toArray('[data-service-row]', scope);
    if (!rows.length) return;
    gsap.from(rows, {
      opacity: 0,
      y: 16,
      duration: 0.7,
      ease: EASE,
      stagger: 0.07,
      scrollTrigger: { trigger: rows[0], start: 'top 88%', once: true },
    });
  });

  return (
    <section ref={sectionRef} id="service" className="paper-grid relative">
      <SheetHeader id="service" />

      <div className="mx-auto max-w-[1400px] px-6 pt-20 md:px-12 md:pt-28">
        <div className="grid items-end gap-8 pb-12 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <h2 className="font-display text-[4.5rem] font-extrabold leading-[0.82] tracking-[-0.01em] sm:text-[6rem] lg:text-[8.5rem]">
            What I can do
          </h2>
          <p className="max-w-[40ch] text-base text-ink-2 md:text-lg">
            Six kinds of work I take on. Open any of them to see what it covers.
          </p>
        </div>
      </div>

      {/* Drawing index: one row per service. */}
      <div className="border-t-[1.5px] border-ink">
        <div className="lettering mx-auto hidden max-w-[1400px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_4rem] gap-6 px-6 py-3 text-[12px] text-ink-2 md:grid md:px-12">
          <span>Service</span>
          <span>Main tools</span>
          <span />
        </div>

        {services.map((service, index) => {
          const open = openIndex === index;
          const panelId = `service-panel-${index}`;
          return (
            <div
              key={service.title}
              data-service-row
              className={`group relative border-t border-ink/50 transition-colors duration-500 ${
                open ? 'bg-paper-2/80' : 'hover:bg-paper-2/50'
              }`}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="mx-auto grid w-full max-w-[1400px] cursor-pointer grid-cols-[minmax(0,1fr)_2rem] items-center gap-4 px-6 py-5 text-left md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_4rem] md:gap-6 md:px-12 md:py-7"
              >
                <span
                  className={`font-display text-[1.75rem] font-bold leading-[1.02] transition-[color,transform] duration-500 ease-expo sm:text-[2.1rem] md:text-[2.6rem] ${
                    open ? 'text-red' : 'group-hover:translate-x-2'
                  }`}
                >
                  {service.title}
                </span>
                <span className="hidden text-[15px] text-ink-2 md:block">{service.tools}</span>
                <span className={`justify-self-end transition-colors duration-300 ${open ? 'text-red' : 'text-ink'}`}>
                  <Toggle open={open} />
                </span>
              </button>

              {/* Height is animated from a 0fr to a 1fr grid track, so every
                  panel opens at its real height and none is ever clipped. */}
              <div
                id={panelId}
                role="region"
                aria-label={service.title}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-expo motion-reduce:transition-none ${
                  open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden" inert={!open}>
                  <div className="mx-auto grid max-w-[1400px] gap-8 px-6 pb-9 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_4rem] md:gap-6 md:px-12 md:pb-12">
                    <div className="flex flex-col items-start gap-6">
                      <p className="max-w-[46ch] text-base leading-relaxed text-ink md:text-lg">{service.description}</p>
                      <p className="text-[15px] text-ink-2 md:hidden">{service.tools}</p>
                      {service.cta && (
                        <a
                          data-magnetic="0.25"
                          href={service.cta.href}
                          className="inline-flex items-center bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-red"
                        >
                          {service.cta.label}
                        </a>
                      )}
                    </div>
                    <ul className="flex flex-col border-t border-ink/30">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="flex items-baseline gap-3 border-b border-ink/30 py-2.5 text-[15px] md:text-base">
                          <span aria-hidden="true" className="relative top-[-2px] h-[7px] w-[7px] shrink-0 border border-ink" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="border-t-[1.5px] border-ink" />
      </div>
      <div className="h-20 md:h-28" />
    </section>
  );
};

export default Services;
