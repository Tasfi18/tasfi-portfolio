import { SheetFrame } from './Drafting';

const ComingSoon = ({ onBack }) => (
  <main className="paper-grid relative flex min-h-[100svh] items-center overflow-hidden">
    <SheetFrame />
    <div className="relative z-10 mx-auto w-full max-w-[1100px] px-8 py-24 md:px-16">
      <p className="lettering text-[12px] text-ink-2">Sheet not yet issued</p>
      <div className="relative mt-4 inline-block">
        <h1 className="font-stencil text-[6rem] font-extrabold leading-[0.85] sm:text-[9rem] md:text-[12rem]">Archive</h1>
        {/* The stamp: what a drawing office puts on a sheet that is still in work. */}
        <span className="lettering absolute -right-4 -top-2 rotate-[-8deg] border-[2.5px] border-red px-3 py-1.5 text-sm text-red sm:-right-10 sm:top-2 sm:text-lg md:text-xl">
          In progress
        </span>
      </div>
      <p className="mt-8 max-w-[44ch] text-base text-ink-2 md:text-lg">
        The full archive of projects is still being drawn. The four plates on the main sheet are the best place to start.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-10 inline-flex cursor-pointer items-center bg-ink px-6 py-3.5 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-red"
      >
        Back to the portfolio
      </button>
    </div>
  </main>
);

export default ComingSoon;
