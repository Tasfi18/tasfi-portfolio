import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import About from './components/About';
import Services from './components/Services';
import Project from './components/Project';
import Changelog from './components/Changelog';
import Play from './components/Play';
import ContactSection from './components/Contact';
import ComingSoon from './components/ComingSoon';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  /**
   * Swap to the archive page and back under a View Transition, so the change
   * reads as turning to another sheet rather than a hard cut. flushSync makes
   * React apply the change inside the transition callback; without it the
   * browser would snapshot the old page twice.
   */
  const swapPage = useCallback((next) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const apply = () => {
      setShowArchive(next);
      window.scrollTo(0, 0);
    };
    if (reduced || typeof document.startViewTransition !== 'function') {
      apply();
      return;
    }
    document.startViewTransition(() => flushSync(apply));
  }, []);

  return (
    <>
      {showArchive ? (
        <ComingSoon onBack={() => swapPage(false)} />
      ) : (
        <main>
          {/* The navbar stays outside the fading wrapper below: an animated
              opacity makes that wrapper its own stacking context, which would
              trap the bar's z-index underneath the hero. */}
          {introDone && <Navbar />}
          <Hero onPreloadComplete={() => setIntroDone(true)} />

          {/* Everything below the cover waits for the intro to finish. */}
          {introDone && (
            <div className="animate-site-in">
              <About />
              <Services />
              <Project onCtaClick={() => swapPage(true)} />
              <Changelog />
              <Play />
              <ContactSection />
            </div>
          )}
        </main>
      )}

      <div aria-hidden="true" className="paper-fibre" />
    </>
  );
}

export default App;
