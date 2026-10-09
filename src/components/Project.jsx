import { useMotion, gsap } from '../lib/motion';
import { projects } from '../config/content';
import { SheetHeader } from './Drafting';
import Plate from './Plates';

/** Crop marks at the four corners of a plate, as on a printed sheet. */
const CropMarks = () => (
  <span aria-hidden="true" className="pointer-events-none absolute -inset-3">
    {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map((pos) => (
      <span key={pos} className={`absolute h-4 w-4 border-ink ${pos}`} />
    ))}
  </span>
);

const ProjectLinks = ({ project }) => {
  const links = [
    project.live && { href: project.live, label: project.plate === 'thesis' ? 'Read the paper' : 'Open live site', primary: true },
    project.repo && { href: project.repo, label: 'View source', primary: !project.live },
  ].filter(Boolean);

  if (!links.length) {
    return (
      <a
        href="#contact"
        className="inline-flex items-center border-[1.5px] border-ink px-5 py-3 text-[15px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
      >
        Ask me about this project
      </a>
    );
  }

  return links.map((link) => (
    <a
      key={link.href}
      data-magnetic="0.25"
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        link.primary
          ? 'inline-flex items-center bg-ink px-5 py-3 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-red'
          : 'inline-flex items-center border-[1.5px] border-ink px-5 py-3 text-[15px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper'
      }
    >
      {link.label}
    </a>
  ));
};

const Project = ({ onCtaClick }) => {
  // Each plate comes out of the plotter once: a wipe from the left edge.
  const sectionRef = useMotion(({ scope }) => {
    gsap.utils.toArray('[data-plate]', scope).forEach((plate) => {
      gsap.fromTo(
        plate,
        { clipPath: 'inset(0px 100% 0px 0px)' },
        {
          clipPath: 'inset(0px 0% 0px 0px)',
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: plate, start: 'top 80%', once: true },
        }
      );
    });
  });

  return (
    <section ref={sectionRef} id="project" className="paper-grid relative">
      <SheetHeader id="project" />

      <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-20 md:px-12 md:pb-32 md:pt-28">
        <div className="mb-20 grid items-end gap-8 lg:mb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <h2 className="font-display text-[4.5rem] font-extrabold leading-[0.82] tracking-[-0.01em] sm:text-[6rem] lg:text-[8.5rem]">
            Selected work
          </h2>
          <div className="flex flex-col items-start gap-6">
            <p className="max-w-[40ch] text-base text-ink-2 md:text-lg">
              Four pieces of work, each shown as a drawing of the system behind it. Two applications, a research study and a product plan.
            </p>
            <button
              type="button"
              data-magnetic="0.25"
              onClick={onCtaClick}
              className="inline-flex cursor-pointer items-center border-[1.5px] border-ink px-5 py-3 text-[15px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              Open the full archive
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-24 lg:gap-36">
          {projects.map((project, i) => {
            const flip = i % 2 === 1;
            return (
              <article
                key={project.name}
                className={`grid items-center gap-10 lg:gap-16 ${
                  flip ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : 'lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]'
                }`}
              >
                <figure className={`min-w-0 ${flip ? 'lg:order-2' : ''}`}>
                  <div className="relative">
                    <CropMarks />
                    {/* On a phone the drawing keeps a readable size and the
                        frame scrolls sideways instead of shrinking it. */}
                    <div data-plate className="overflow-x-auto border-[1.5px] border-ink bg-paper p-3 md:p-5">
                      {project.image ? (
                        <img src={project.image} alt={project.name} loading="lazy" decoding="async" className="block w-full" />
                      ) : (
                        <Plate kind={project.plate} title={`Diagram: ${project.name}`} className="min-w-[520px] md:min-w-0" />
                      )}
                    </div>
                  </div>
                  <figcaption className="lettering mt-5 flex justify-between gap-4 text-[12px] text-ink-2">
                    <span>Plate {i + 1}</span>
                    <span>{project.year}</span>
                  </figcaption>
                </figure>

                <div className={`min-w-0 ${flip ? 'lg:order-1' : ''}`}>
                  <h3 className="font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.005em] md:text-[3.4rem]">
                    {project.name}
                  </h3>
                  <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink md:text-[17px]">{project.summary}</p>

                  <ul className="mt-6 flex flex-col">
                    {project.notes.map((note) => (
                      <li key={note} className="flex items-baseline gap-3 border-t border-ink/25 py-2 text-[15px] text-ink-2 last:border-b">
                        <span aria-hidden="true" className="relative top-[-2px] h-[7px] w-[7px] shrink-0 border border-ink" />
                        {note}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-6 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-[15px]">
                    <dt className="lettering pt-0.5 text-[12px] text-ink-2">Role</dt>
                    <dd>{project.role}</dd>
                    <dt className="lettering pt-0.5 text-[12px] text-ink-2">Stack</dt>
                    <dd>{project.stack}</dd>
                  </dl>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <ProjectLinks project={project} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Project;
