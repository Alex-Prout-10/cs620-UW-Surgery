'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import AccessibilityToggles from '@/components/AccessibilityToggles';
import { COMMON_QUESTIONS } from '@/lib/commonQuestions';

type InfoPanel = 'questions' | 'about' | 'testing' | 'resources' | 'safety';

type ChatWorkspaceProps = {
  children: ReactNode;
  conversation: ReactNode;
  isEmpty: boolean;
  clearing: boolean;
  clinicDescription?: string;
  onNewChat: () => void;
  onQuestionSelect: (prompt: string) => void;
};

const CHAT_THEME_STORAGE_KEY = 'navigator_chat_theme';

const infoItems: { id: InfoPanel; label: string; icon: string }[] = [
  { id: 'questions', label: 'Common questions', icon: 'question' },
  { id: 'about', label: 'About this chatbot', icon: 'info' },
  { id: 'testing', label: 'Lab testing guide', icon: 'lab' },
  { id: 'resources', label: 'Resources', icon: 'book' },
  { id: 'safety', label: 'Safety & privacy', icon: 'shield' },
];

function SmallIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.1-1.6 2.6M12 17h.01" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    lab: <><path d="M9 3h6M10 3v6l-5.2 8.2A2 2 0 0 0 6.5 20h11a2 2 0 0 0 1.7-2.8L14 9V3M8 15h8" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21zM4 5.5v15M8 7h8M8 11h8" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
    chevron: <><path d="m7 10 5 5 5-5" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="chat-ui-icon"
    >
      {paths[name] ?? paths.info}
    </svg>
  );
}

function NetworkArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 280"
      fill="none"
      className="chat-network-art"
    >
      <path d="m32 186 75-88 72 35 69-86 81 68 77-43M107 98l8 100 64-65 39 89 69-107 52 105 60-108M179 133l48-2 47-16 70-38" />
      <circle cx="32" cy="186" r="4" />
      <circle cx="107" cy="98" r="5" />
      <circle cx="115" cy="198" r="3" />
      <circle cx="179" cy="133" r="5" />
      <circle cx="188" cy="133" r="2" />
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

function InfoContent({
  panel,
  onQuestionSelect,
}: {
  panel: InfoPanel;
  onQuestionSelect: (prompt: string) => void;
}) {
  if (panel === 'questions') {
    return (
      <div className="chat-info-question-list">
        <p className="chat-info-copy">
          Choose a question to place it in the message field. You can edit it before sending.
        </p>
        {COMMON_QUESTIONS.map((question) => (
          <button
            key={question.id}
            type="button"
            className="chat-info-question"
            onClick={() => onQuestionSelect(question.prompt)}
          >
            <span>{question.label}</span>
            <SmallIcon name="arrow" />
          </button>
        ))}
      </div>
    );
  }

  if (panel === 'about') {
    return (
      <div className="chat-info-copy">
        <p>
          The Adrenal Nodule Chatbot is curated and endorsed by the UW Adrenal Nodule team. It helps you understand adrenal nodules and prepare for conversations with your care team.
        </p>
        <p>
          Answers draw on selected UW Health education materials and established clinical guidelines. When available, source links appear with the answer so you can review them.
        </p>
        <div className="chat-info-disclosures">
          <details>
            <summary>What it can help with <SmallIcon name="chevron" /></summary>
            <p>Get general explanations about adrenal nodules, hormone tests, imaging, follow-up, and treatment discussions. It can also help you prepare questions for an appointment.</p>
          </details>
          <details>
            <summary>How to use it <SmallIcon name="chevron" /></summary>
            <p>Ask a question, choose a common question to add it to the composer, and press Send when you are ready. Open Sources under an answer to review its references.</p>
          </details>
          <details>
            <summary>Focused and source-based <SmallIcon name="chevron" /></summary>
            <p>This tool is designed for adrenal nodule education and uses a selected health information library rather than searching the open internet.</p>
          </details>
          <details>
            <summary>A guide, not a diagnosis <SmallIcon name="chevron" /></summary>
            <p>It cannot see your medical record or decide which tests or treatment are right for you. Your care team can interpret your results in context.</p>
          </details>
        </div>
      </div>
    );
  }

  if (panel === 'testing') {
    const steps = [
      { title: 'Prepare for the test', text: 'Schedule a blood draw for 8am at your nearest blood draw facility. Pick up the medication dexamethasone, which will be prescribed for you.' },
      { title: 'The night before', text: 'Take the dexamethasone at 11pm the night before your blood draw. You can take your other medications as normal.' },
      { title: 'Day of the tests', text: 'Arrive before 8am to get your blood drawn right at 8am. It is okay to eat breakfast, although avoid coffee if you can.' },
      { title: 'After the tests', text: 'A provider will reach out to discuss results. If they are abnormal, they will arrange a visit with a surgeon to discuss treatment. If they are normal, they can discuss what follow-up, if any, is recommended.' },
    ];

    return (
      <div className="chat-info-copy">
        <p>If your care team ordered morning adrenal hormone testing, these steps can help you prepare. Follow any instructions from your own care team.</p>
        <ol className="chat-lab-timeline">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="chat-lab-step-number">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (panel === 'resources') {
    return (
      <div className="chat-resource-list">
        <a href="https://www.uwhealth.org/treatments/endocrine-surgery" target="_blank" rel="noreferrer">
          <span><strong>UW Endocrine Surgery</strong><small>Clinic and treatment information</small></span><SmallIcon name="external" />
        </a>
        <a href="https://www.uwhealth.org/laboratory-services#2aKcLLILK6b8Y2Q4UThgDL" target="_blank" rel="noreferrer">
          <span><strong>UW Laboratory Services</strong><small>Locations and blood draw information</small></span><SmallIcon name="external" />
        </a>
        <a href="/FINAL-Adrenal-Nodual-Workflow-Flyer.pdf" target="_blank" rel="noreferrer">
          <span><strong>Adrenal nodule workflow flyer</strong><small>UW patient guide (PDF)</small></span><SmallIcon name="external" />
        </a>
      </div>
    );
  }

  return (
    <div className="chat-info-copy">
      <h3 className="chat-info-subheading">Protect your privacy</h3>
      <p>Please do not include your date of birth, Social Security number, insurance details, or other sensitive personal information.</p>
      <h3 className="chat-info-subheading">What this tool can do</h3>
      <p>This tool provides general education and navigation support. It does not diagnose, make individualized medical decisions, or replace care from your clinicians.</p>
      <h3 className="chat-info-subheading">Urgent help</h3>
      <p>If you have severe symptoms, chest pain, difficulty breathing, fainting, or are in immediate danger, call 911 or seek emergency care.</p>
      <p>If you are in the U.S. and thinking about suicide or self-harm, call or text 988. If you may act now or someone has already been hurt, call 911.</p>
      <a className="chat-clinic-link" href="tel:+16082422888">Call UW Endocrine Surgery Clinic: (608) 242-2888</a>
    </div>
  );
}

export default function ChatWorkspace({
  children,
  conversation,
  isEmpty,
  clearing,
  clinicDescription,
  onNewChat,
  onQuestionSelect,
}: ChatWorkspaceProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<InfoPanel | null>(null);
  const [lightMode, setLightMode] = useState(true);
  const [themePreferenceLoaded, setThemePreferenceLoaded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const infoPanelRef = useRef<HTMLElement>(null);
  const closeInfoRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setLightMode(localStorage.getItem(CHAT_THEME_STORAGE_KEY) !== 'dark');
    } catch {
      setLightMode(true);
    }
    setThemePreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!themePreferenceLoaded) return;
    try {
      localStorage.setItem(CHAT_THEME_STORAGE_KEY, lightMode ? 'light' : 'dark');
    } catch {
      // The theme still works for this visit if storage is unavailable.
    }
  }, [lightMode, themePreferenceLoaded]);

  const panelTitle = activePanel
    ? infoItems.find((item) => item.id === activePanel)?.label ?? 'Guide'
    : '';

  const openPanel = (panel: InfoPanel, trigger: HTMLButtonElement) => {
    panelTriggerRef.current = mobileNavOpen ? menuButtonRef.current : trigger;
    setMobileNavOpen(false);
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
    window.requestAnimationFrame(() => panelTriggerRef.current?.focus());
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!activePanel) return;
    closeInfoRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = infoPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePanel]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    mobileCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileNav();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  const pickQuestion = (prompt: string) => {
    onQuestionSelect(prompt);
    setActivePanel(null);
  };

  return (
    <div className={`chat-app-shell${lightMode ? ' chat-app-shell--light' : ''}`}>
      <a className="chat-skip-link" href="#chat-conversation">Skip to conversation</a>
      <header className="chat-app-header">
        <div className="chat-header-brand-row">
          <button
            type="button"
            className="chat-desktop-sidebar-toggle"
            aria-label={desktopSidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
            aria-expanded={desktopSidebarOpen}
            aria-controls="chat-side-navigation"
            onClick={() => setDesktopSidebarOpen((open) => !open)}
          >
            <SmallIcon name={desktopSidebarOpen ? 'close' : 'menu'} />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="chat-mobile-menu-button"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="chat-side-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <SmallIcon name={mobileNavOpen ? 'close' : 'menu'} />
          </button>
          <Link href="/" className="chat-brand" aria-label="UW Adrenal Nodule Patient Guide home">
            <span className="chat-brand-mark" aria-hidden="true">W</span>
            <span className="chat-brand-copy"><strong>UW Endocrinology</strong><small>Adrenal Nodule Navigator</small></span>
          </Link>
        </div>
        <div className="chat-header-tools">
          <a className="chat-header-phone" href="tel:+16082422888">Clinic <strong>(608) 242-2888</strong></a>
          <button
            type="button"
            className="chat-theme-toggle"
            aria-label={`Switch to ${lightMode ? 'dark' : 'light'} mode`}
            aria-pressed={lightMode}
            title={`Switch to ${lightMode ? 'dark' : 'light'} mode`}
            onClick={() => setLightMode((light) => !light)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {lightMode ? (
                <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
              ) : (
                <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>
              )}
            </svg>
            <span>{lightMode ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <AccessibilityToggles onDark={!lightMode} compact />
        </div>
      </header>

      <div className={`chat-app-body${desktopSidebarOpen ? '' : ' chat-app-body--sidebar-closed'}`}>
        {mobileNavOpen && (
          <button
            type="button"
            className="chat-mobile-backdrop"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          />
        )}
        <aside
          ref={sidebarRef}
          id="chat-side-navigation"
          className={`chat-sidebar${mobileNavOpen ? ' chat-sidebar--open' : ''}${desktopSidebarOpen ? '' : ' chat-sidebar--collapsed'}`}
          role={mobileNavOpen ? 'dialog' : undefined}
          aria-modal={mobileNavOpen ? true : undefined}
          aria-labelledby={mobileNavOpen ? 'chat-mobile-navigation-heading' : undefined}
          aria-label="Chat navigation and patient information"
        >
          <div className="chat-sidebar-mobile-heading">
            <span id="chat-mobile-navigation-heading">Navigation</span>
            <button ref={mobileCloseRef} type="button" aria-label="Close navigation menu" onClick={closeMobileNav}>
              <SmallIcon name="close" />
            </button>
          </div>
          <button type="button" className="chat-new-button" onClick={onNewChat} disabled={clearing}>
            <SmallIcon name="plus" />
            <span>{clearing ? 'Starting…' : 'New chat'}</span>
          </button>

          <div className="chat-sidebar-label">Your guide</div>
          <nav className="chat-guide-nav" aria-label="Patient information">
            {infoItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chat-guide-link"
                onClick={(event) => openPanel(item.id, event.currentTarget)}
              >
                <SmallIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="chat-sidebar-divider" />
          <div className="chat-sidebar-callout">
            <span className="chat-sidebar-eyebrow">A UW Adrenal team resource</span>
            <p>{clinicDescription ?? 'General education to help you understand your next steps.'}</p>
          </div>

          <div className="chat-sidebar-bottom">
            <Link href="/" className="chat-back-home">Patient guide home <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-main-topline">
            <div><span className="chat-status-dot" />UW Endocrinology Resource</div>
            <button
              type="button"
              className="chat-main-info-button"
              onClick={(event) => openPanel('safety', event.currentTarget)}
            >
              <SmallIcon name="shield" /><span>Safety & privacy</span>
            </button>
          </div>

          <div className={`chat-network-wrap${isEmpty ? ' chat-network-wrap--welcome' : ''}`}><NetworkArt /></div>

          <section id="chat-conversation" className="chat-transcript" aria-label="Conversation">
            <div className={`chat-conversation-column${isEmpty ? ' chat-conversation-column--empty' : ''}`}>
              {isEmpty && (
                <div className="chat-welcome">
                  <div className="chat-welcome-mark" aria-hidden="true"><span>W</span><i /><i /><i /></div>
                  <p className="chat-welcome-kicker">UW Adrenal Nodule team</p>
                  <h1>What would you like to understand about your adrenal nodule?</h1>
                  <p className="chat-welcome-description">Ask a question or choose a prompt to add it to your message. You decide when to send.</p>
                  <div className="chat-welcome-prompts" aria-label="Suggested questions">
                    {COMMON_QUESTIONS.slice(0, 4).map((question) => (
                      <button key={question.id} type="button" onClick={() => onQuestionSelect(question.prompt)}>
                        <span>{question.label}</span><SmallIcon name="arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {conversation}
            </div>
          </section>

          <div className="chat-composer-dock">
            <div className="chat-composer-column">{children}</div>
            <div className="chat-legal-line">
              General education, not a diagnosis. For an emergency, call 911.
              <button type="button" onClick={(event) => openPanel('safety', event.currentTarget)}>Privacy & safety details</button>
            </div>
          </div>
        </main>

        {activePanel && (
          <>
            <button type="button" className="chat-panel-backdrop" aria-label="Close information panel" onClick={closePanel} />
            <aside
              ref={infoPanelRef}
              className="chat-info-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-info-heading"
              tabIndex={-1}
            >
              <div className="chat-info-header">
                <div><span className="chat-info-eyebrow">Patient information</span><h2 id="chat-info-heading">{panelTitle}</h2></div>
                <button ref={closeInfoRef} type="button" className="chat-info-close" aria-label="Close information panel" onClick={closePanel}>
                  <SmallIcon name="close" />
                </button>
              </div>
              <div className="chat-info-body">
                <InfoContent panel={activePanel} onQuestionSelect={pickQuestion} />
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
