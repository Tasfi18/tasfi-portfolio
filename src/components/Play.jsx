import { gameLayers } from '../config/content';
import { SheetHeader } from './Drafting';
import StackGame from './StackGame';

const Play = () => (
  <section id="play" className="paper-grid relative">
    <SheetHeader id="play" />

    <div className="mx-auto grid max-w-[1400px] items-start gap-10 px-6 py-20 md:px-12 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:gap-14">
      <div className="min-w-0 lg:sticky lg:top-28">
        <h2 className="font-display text-[4.5rem] font-extrabold leading-[0.82] tracking-[-0.01em] sm:text-[5.5rem] lg:text-[6rem]">
          Build the stack
        </h2>
        <p className="mt-6 max-w-[36ch] text-base text-ink-2 md:text-[17px]">
          Each layer has to sit on the one below it. Drop it as it passes over the stack. Whatever hangs over the edge is cut
          off, so the next layer is smaller.
        </p>
        <dl className="mt-8 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-5 gap-y-2.5 border-t border-ink/40 pt-5 text-[15px]">
          <dt className="lettering pt-0.5 text-[12px] text-ink-2">Drop</dt>
          <dd>Space, Enter, click or tap</dd>
          <dt className="lettering pt-0.5 text-[12px] text-ink-2">Exact</dt>
          <dd>Land within 4 pixels and it snaps square</dd>
          <dt className="lettering pt-0.5 text-[12px] text-ink-2">Order</dt>
          <dd>Database first, release last</dd>
        </dl>
      </div>

      <StackGame layers={gameLayers} className="min-w-0" />
    </div>
  </section>
);

export default Play;
