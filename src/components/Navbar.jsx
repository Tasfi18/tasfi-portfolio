import { useCallback, useEffect, useRef, useState } from 'react';
import site from '../config/site';
import { SHEETS, sheetNumber } from '../config/sheets';

/** Local time where I am, so a visitor knows whether a reply is likely soon. */
const useLocalTime = (timeZone) => {
  const format = useCallback(
    () =>
      new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date()),
    [timeZone]
  );
  const [time, setTime] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, [format]);

  return time;
};

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);
  const ticking = useRef(false);
  const buttonRef = useRef(null);
  const time = useLocalTime(site.timezone);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // One passive, rAF-throttled listener drives the bar's ground and the
  // scale bar along its bottom edge.
  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 24);
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
      ticking.current = false;
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Whichever sheet owns the middle of the viewport is the current one.
  useEffect(() => {
    const sections = SHEETS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  // On the blueprint sheet the bar switches to chalk on blue.
  const onBlueprint = active === 'contact' && !open;

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,opacity,background-color,border-color,color] duration-500 ease-expo motion-reduce:transition-none ${
          mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${
          open
            ? 'bg-transparent border-b border-transparent text-ink'
            : scrolled
              ? onBlueprint
                ? 'bg-cyano/90 backdrop-blur-md border-b border-chalk/25 text-chalk'
                : 'bg-paper/90 backdrop-blur-md border-b border-ink/15 text-ink'
              : 'bg-transparent border-b border-transparent text-ink'
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 md:px-12">
          <a
            href="#home"
            onClick={close}
            aria-label={`${site.name}, back to top`}
            className="relative z-50 flex items-baseline gap-2.5 font-display text-2xl font-extrabold leading-none tracking-tight"
          >
            {site.short}
            <span className="lettering hidden text-[11px] font-semibold opacity-70 sm:inline">
              {sheetNumber(active)} {SHEETS.find((s) => s.id === active)?.label}
            </span>
          </a>

          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {SHEETS.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`group relative flex items-baseline gap-1.5 py-1.5 text-[15px] font-medium transition-colors duration-300 ${
                      isActive ? (onBlueprint ? 'text-chalk' : 'text-red') : 'hover:text-red'
                    }`}
                  >
                    <span className="lettering text-[10px] opacity-60">{sheetNumber(s.id)}</span>
                    {s.label}
                    {/* A dimension line under the current sheet. */}
                    <span
                      aria-hidden="true"
                      className={`dim dim-sm absolute -bottom-0.5 left-0 right-0 origin-left transition-transform duration-500 ease-expo ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    >
                      <i />
                      <i />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <span className="lettering hidden text-[12px] tabular-nums opacity-80 xl:inline" title="Local time in Dhaka">
            Dhaka {time}
          </span>

          <button
            ref={buttonRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[7px] lg:hidden"
          >
            <span className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 ease-expo ${open ? 'translate-y-[4.25px] rotate-45' : ''}`} />
            <span className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 ease-expo ${open ? '-translate-y-[4.25px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Scale bar: ticks every tenth of the page, filled as you read. */}
        <div
          aria-hidden="true"
          className="relative h-[5px] transition-opacity duration-300"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 10%)',
            backgroundSize: '100% 5px',
            opacity: scrolled && !open ? 0.9 : 0,
          }}
        >
          <div
            className={`absolute inset-x-0 bottom-0 h-[2px] origin-left ${onBlueprint ? 'bg-chalk' : 'bg-red'}`}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`paper-grid fixed inset-0 z-40 flex flex-col justify-center px-8 transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-3">
          {SHEETS.map((s, i) => (
            <li
              key={s.id}
              className={`border-b border-ink/20 pb-3 transition-[transform,opacity] duration-500 ease-expo ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: open ? `${100 + i * 50}ms` : '0ms' }}
            >
              <a
                href={`#${s.id}`}
                onClick={close}
                className={`flex items-baseline gap-4 font-display text-[2.6rem] font-extrabold leading-none ${
                  active === s.id ? 'text-red' : 'text-ink'
                }`}
              >
                <span className="lettering w-7 text-sm font-semibold text-ink-2">{sheetNumber(s.id)}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="lettering mt-10 text-xs text-ink-2">Dhaka {time}</p>
      </div>
    </>
  );
};

export default Navbar;
