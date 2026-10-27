'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const labSteps = [
  {
    title: 'Prepare for the test',
    description:
      'Schedule a blood draw for 8am at your nearest blood draw facility. Pick up the medication dexamethasone, which will be prescribed for you.',
  },
  {
    title: 'The night before',
    description:
      'Take the dexamethasone at 11pm the night before your blood draw. You can take your other medications as normal.',
  },
  {
    title: 'Day of the tests',
    description:
      'Arrive before 8am to get your blood drawn right at 8am. It is okay to eat breakfast, although avoid coffee if you can.',
  },
  {
    title: 'After the tests',
    description:
      'A provider will reach out to discuss results. If they are abnormal, they will arrange a visit with a surgeon to discuss treatment. If they are normal, they can discuss what follow-up, if any, is recommended.',
  },
];

function HomeCircuitArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 280"
      fill="none"
      className="home-circuit-art"
    >
      <path d="m32 186 75-88 72 35 69-86 81 68 77-43M107 98l8 100 64-65 39 89 69-107 52 105 60-108M179 133l48-2 47-16 70-38" />
      <circle cx="32" cy="186" r="4" />
      <circle cx="107" cy="98" r="5" />
      <circle cx="115" cy="198" r="3" />
      <circle cx="179" cy="133" r="5" />
      <circle cx="227" cy="222" r="4" />
      <circle cx="248" cy="47" r="4" />
      <circle cx="274" cy="115" r="5" />
      <circle cx="329" cy="115" r="3" />
      <circle cx="350" cy="72" r="5" />
      <circle cx="406" cy="72" r="3" />
      <circle cx="352" cy="222" r="4" />
      <circle cx="406" cy="114" r="5" />
    </svg>
  );
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [labGuideOpen, setLabGuideOpen] = useState(false);
  const [activeLabStep, setActiveLabStep] = useState(0);
  const mobileSidebarRef = useRef<HTMLElement>(null);
  const mobileSidebarToggleRef = useRef<HTMLButtonElement>(null);
  const mobileSidebarCloseRef = useRef<HTMLButtonElement>(null);
  const desktopSidebarOpenRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileSidebarCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileSidebarOpen(false);
        window.requestAnimationFrame(() => mobileSidebarToggleRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = mobileSidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const closeOnDesktopResize = () => {
      if (window.innerWidth > 760) setMobileSidebarOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', closeOnDesktopResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', closeOnDesktopResize);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [mobileSidebarOpen]);

  const closeSidebar = () => {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setMobileSidebarOpen(false);
      window.requestAnimationFrame(() => mobileSidebarToggleRef.current?.focus());
      return;
    }
    setSidebarOpen(false);
    window.requestAnimationFrame(() => desktopSidebarOpenRef.current?.focus());
  };

  const closeSidebarOnMobile = () => {
    if (window.matchMedia('(max-width: 760px)').matches) closeSidebar();
  };

  return (
    <div className="home-experience">
      <div className="home-circuit-wrap" aria-hidden="true">
        <HomeCircuitArt />
      </div>

      <div className={`home-page-layout${sidebarOpen ? '' : ' home-page-layout--sidebar-closed'}${mobileSidebarOpen ? ' home-page-layout--mobile-sidebar-open' : ''}`}>
        {mobileSidebarOpen && (
          <button
            type="button"
            className="home-guide-backdrop"
            aria-label="Close patient guide navigation"
            onClick={closeSidebar}
          />
        )}

        <aside
          ref={mobileSidebarRef}
          id="home-guide-sidebar"
          className="home-guide-sidebar"
          role={mobileSidebarOpen ? 'dialog' : undefined}
          aria-modal={mobileSidebarOpen ? true : undefined}
          aria-labelledby={mobileSidebarOpen ? 'home-guide-heading' : undefined}
          aria-label="Patient guide navigation"
        >
          <div className="home-guide-header">
            <div className="home-guide-identity">
              <span>UW patient guide</span>
              <strong id="home-guide-heading">Adrenal nodule care</strong>
            </div>
            <button
              ref={mobileSidebarCloseRef}
              type="button"
              className="home-guide-close"
              aria-label="Close patient guide sidebar"
              aria-expanded={mobileSidebarOpen || sidebarOpen}
              aria-controls="home-guide-sidebar"
              onClick={closeSidebar}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <div className="home-guide-group">
            <span className="home-guide-label">On this page</span>
            <nav className="home-guide-nav" aria-label="Page sections">
              <a href="#home-title" onClick={closeSidebarOnMobile}><span>01</span><span>Video overview</span></a>
              <a href="#lab-testing-resources" onClick={closeSidebarOnMobile}><span>02</span><span>Hormone testing</span></a>
            </nav>
          </div>

          <div className="home-guide-divider" />

          <div className="home-guide-group home-guide-resources">
            <span className="home-guide-label">UW resources</span>
            <a href="https://www.uwhealth.org/treatments/endocrine-surgery" target="_blank" rel="noreferrer">
              Endocrine Surgery
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>
            </a>
            <a href="https://www.uwhealth.org/laboratory-services#2aKcLLILK6b8Y2Q4UThgDL" target="_blank" rel="noreferrer">
              Laboratory Services
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>
            </a>
          </div>

        </aside>

        <div className="home-content">
          <div className="home-content-toolbar">
            <button
              ref={mobileSidebarToggleRef}
              type="button"
              className="home-mobile-sidebar-toggle"
              aria-label={mobileSidebarOpen ? 'Close patient guide navigation' : 'Open patient guide navigation'}
              aria-expanded={mobileSidebarOpen}
              aria-controls="home-guide-sidebar"
              onClick={() => setMobileSidebarOpen((open) => !open)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">{mobileSidebarOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
              <span>Guide</span>
            </button>
            {!sidebarOpen && (
              <button
                ref={desktopSidebarOpenRef}
                type="button"
                className="home-guide-open"
                aria-label="Open patient guide sidebar"
                aria-expanded={sidebarOpen}
                aria-controls="home-guide-sidebar"
                onClick={() => {
                  setSidebarOpen(true);
                  window.requestAnimationFrame(() => mobileSidebarCloseRef.current?.focus());
                }}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span>Open guide</span>
              </button>
            )}
          </div>
          <section className="home-video-section" aria-labelledby="home-title">
            <div className="home-eyebrow">
              <span className="home-status-dot" aria-hidden="true" />
              UW Endocrinology Resource
            </div>
            <div className="home-heading-row">
              <div>
                <h1 id="home-title">
                  Understanding your <span className="home-title-keep-together">adrenal nodule</span>
                </h1>
                <p className="home-intro-copy">
                  Start with a short overview from the UW Endocrine Surgery team
                  about what an adrenal nodule is and what may happen next.
                </p>
              </div>
              <div className="home-video-length" aria-label="Video length: 1 minute 58 seconds">
                <span>01:58</span>
                <small>Patient overview</small>
              </div>
            </div>

            <figure className="home-video-feature">
              <div className="home-video-frame">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/poster.png"
                  aria-label="UW Endocrine Surgery overview: what an adrenal nodule means and what happens next"
                  className="home-featured-video"
                >
                  <source
                    src="https://0qduonpuurottffe.public.blob.vercel-storage.com/Patient%20adrenal%20copy.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <figcaption>
                <span>UW Department of Endocrine Surgery</span>
                <span>What patients should know about adrenal incidentalomas</span>
              </figcaption>
            </figure>
          </section>

          <section
            id="lab-testing-resources"
            className="home-lab-section"
            aria-labelledby="lab-testing-title"
          >
            <div className="home-lab-heading">
              <h2 id="lab-testing-title">Preparing for your hormone test</h2>
            </div>

            <button
              type="button"
              className="home-lab-toggle"
              aria-expanded={labGuideOpen}
              aria-controls="home-lab-instructions"
              onClick={() => setLabGuideOpen((open) => !open)}
            >
              <span>Prepare for your testing</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div id="home-lab-instructions" className="home-lab-interactive" hidden={!labGuideOpen}>
              <p className="home-lab-note">
                Follow any instructions given to you by your own care team.
              </p>
              <ol
                className="home-lab-timeline"
                style={{
                  '--home-lab-progress': `${12.5 + (activeLabStep / (labSteps.length - 1)) * 75}%`,
                } as CSSProperties}
              >
                {labSteps.map((step, index) => (
                  <li key={step.title}>
                    <button
                      type="button"
                      className="home-lab-step"
                      aria-pressed={activeLabStep === index}
                      onClick={() => setActiveLabStep(index)}
                    >
                      <span className="home-lab-step-number" aria-hidden="true">0{index + 1}</span>
                      <span className="home-lab-step-title">{step.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="home-lab-detail" aria-live="polite">
                <span className="home-lab-detail-kicker">Step {activeLabStep + 1} of {labSteps.length}</span>
                <h3>{labSteps[activeLabStep].title}</h3>
                <p>{labSteps[activeLabStep].description}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
