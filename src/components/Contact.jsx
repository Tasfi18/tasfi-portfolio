import { useRef, useState } from 'react';
import site from '../config/site';
import { SheetHeader } from './Drafting';
import { SHEETS } from '../config/sheets';

const footerLinks = SHEETS.filter((s) => s.id !== 'contact');

const elsewhere = [
  { label: 'GitHub', href: site.socials.github },
  { label: 'LinkedIn', href: site.socials.linkedin },
  { label: 'Fiverr', href: site.socials.fiverr },
].filter((s) => s.href);

const waLink = site.whatsapp
  ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi ${site.short}, I found your portfolio and would like to talk.`)}`
  : '';

/** A row of the details table. Copy is offered on rows that have a value worth copying. */
const DetailRow = ({ label, children, copy }) => {
  const [copied, setCopied] = useState(false);
  const valueRef = useRef(null);

  const onCopy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(copy).then(done, () => selectValue());
    } else {
      selectValue();
    }
  };
  const selectValue = () => {
    const range = document.createRange();
    range.selectNodeContents(valueRef.current);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] border-b border-chalk/30 last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)]">
      <dt className="lettering flex items-start border-r border-chalk/30 px-4 py-4 text-[11px] text-chalk/70 md:px-5 md:py-5">
        {label}
      </dt>
      <dd className="flex min-w-0 items-start justify-between gap-3 px-4 py-4 md:px-5 md:py-5">
        <span ref={valueRef} className="min-w-0 break-words text-base md:text-lg">
          {children}
        </span>
        {copy && (
          <button
            type="button"
            onClick={onCopy}
            className="lettering shrink-0 border border-chalk/40 px-2 py-1 text-[11px] transition-colors duration-300 hover:bg-chalk hover:text-cyano"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </dd>
    </div>
  );
};

const ContactSection = () => {
  const ref = useRef(null);
  const [cursor, setCursor] = useState(null);

  // A drafting crosshair follows the pointer across the blueprint, with its
  // coordinates read off in millimetres from the sheet's corner (1px = 0.26mm).
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <section
      ref={ref}
      id="contact"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setCursor(null)}
      className="blueprint-grid relative overflow-hidden text-chalk"
    >
      {cursor && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute left-0 right-0 h-px bg-chalk/35" style={{ top: cursor.y }} />
          <span className="absolute bottom-0 top-0 w-px bg-chalk/35" style={{ left: cursor.x }} />
          <span
            className="lettering absolute whitespace-nowrap text-[11px] tabular-nums text-chalk/80"
            style={{ left: cursor.x + 10, top: cursor.y + 8 }}
          >
            X {String(Math.round(cursor.x * 0.26)).padStart(3, '0')} Y {String(Math.round(cursor.y * 0.26)).padStart(3, '0')}
          </span>
        </div>
      )}

      <SheetHeader id="contact" tone="blueprint" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 pt-20 md:px-12 md:pb-24 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-3 border border-chalk/40 px-3 py-1.5 text-sm">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inset-0 rounded-full border border-chalk animate-sweep" />
                <span className="relative h-2 w-2 rounded-full bg-chalk" />
              </span>
              Open to new work
            </p>

            <h2 className="mt-8 font-display text-[5rem] font-extrabold leading-[0.82] tracking-[-0.01em] sm:text-[6.5rem] lg:text-[8rem]">
              Get in touch
            </h2>

            <p className="mt-7 max-w-[42ch] text-base leading-relaxed text-chalk/85 md:text-lg">
              I take on freelance projects, contract work and collaborations: web applications, APIs and systems for shops
              and offices. Email is the surest way to reach me.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center bg-chalk px-6 py-3.5 text-[15px] font-semibold text-cyano transition-colors duration-300 hover:bg-white"
              >
                Send an email
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border-[1.5px] border-chalk px-6 py-3.5 text-[15px] font-semibold transition-colors duration-300 hover:bg-chalk hover:text-cyano"
                >
                  Message on WhatsApp
                </a>
              )}
              {site.socials.fiverr && (
                <a
                  href={site.socials.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border-[1.5px] border-chalk px-6 py-3.5 text-[15px] font-semibold transition-colors duration-300 hover:bg-chalk hover:text-cyano"
                >
                  Hire me on Fiverr
                </a>
              )}
            </div>
          </div>

          <div className="min-w-0 lg:pt-4">
            <dl className="border-[1.5px] border-chalk bg-cyano/60">
              <DetailRow label="Email" copy={site.email}>
                <a href={`mailto:${site.email}`} className="draw-link">
                  {site.email}
                </a>
              </DetailRow>
              {site.phone && (
                <DetailRow label="Phone" copy={site.phone}>
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="draw-link">
                    {site.phone}
                  </a>
                </DetailRow>
              )}
              <DetailRow label="Based in">{site.location}</DetailRow>
              <DetailRow label="Now">{site.now}</DetailRow>
              {elsewhere.length > 0 && (
                <DetailRow label="Elsewhere">
                  <span className="flex flex-wrap gap-x-5 gap-y-1">
                    {elsewhere.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="draw-link">
                        {s.label}
                      </a>
                    ))}
                  </span>
                </DetailRow>
              )}
            </dl>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mx-auto max-w-[1400px] px-6 pb-8 md:px-12">
        <div className="flex flex-col-reverse justify-between gap-5 border-t border-chalk/30 pt-6 text-sm text-chalk/75 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} className="draw-link transition-colors duration-300 hover:text-chalk">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </section>
  );
};

export default ContactSection;
