'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import AccessibilityToggles from '@/components/AccessibilityToggles';

const HOME_THEME_STORAGE_KEY = 'navigator_home_theme';

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [homeLightMode, setHomeLightMode] = useState(true);
  const [themePreferencesLoaded, setThemePreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      setHomeLightMode(localStorage.getItem(HOME_THEME_STORAGE_KEY) !== 'dark');
    } catch {
      setHomeLightMode(true);
    }
    setThemePreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!themePreferencesLoaded) return;

    const root = document.documentElement;
    root.classList.toggle('home-light-mode', homeLightMode);
    try {
      localStorage.setItem(HOME_THEME_STORAGE_KEY, homeLightMode ? 'light' : 'dark');
    } catch {
      // The theme control still works for this page view if storage is unavailable.
    }
  }, [homeLightMode, themePreferencesLoaded]);

  if (pathname === '/chat' || pathname?.startsWith('/chat/')) {
    return <>{children}</>;
  }

  return (
    <div className={`page-shell${isHome ? ' page-shell--home' : ''}`}>
      <div className={`site-masthead${isHome ? ' site-masthead--home' : ''}`}>
        {!isHome && (
          <div className="clinic-topline">
            <div className="clinic-topline-inner">
              <span>
                UW Endocrine Surgery Clinic:{' '}
                <a href="tel:+16082422888">(608) 242-2888</a>
              </span>
            </div>
          </div>
        )}
        <header className="site-masthead-navigation border-b-2 border-uwred bg-white/90 backdrop-blur">
          <div className="site-header-container">
            {isHome ? (
              <nav className="site-home-nav" aria-label="Main navigation">
                <Link href="/" className="site-home-brand" aria-label="UW Adrenal Nodule Patient Guide home">
                  <span className="site-home-mark" aria-hidden="true">W</span>
                  <span className="site-home-brand-copy">
                    <strong>UW Endocrinology</strong>
                    <small>Adrenal Nodule Navigator</small>
                  </span>
                </Link>
                <div className="site-home-actions">
                  <Link href="/chat" className="site-home-chat-link">
                    Ask the chatbot
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                  <a className="site-home-phone" href="tel:+16082422888">
                    Clinic <strong>(608) 242-2888</strong>
                  </a>
                  <button
                    type="button"
                    className="home-theme-toggle"
                    aria-label={`Switch to ${homeLightMode ? 'dark' : 'light'} mode`}
                    aria-pressed={homeLightMode}
                    title={`Switch to ${homeLightMode ? 'dark' : 'light'} mode`}
                    onClick={() => setHomeLightMode((light) => !light)}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {homeLightMode ? (
                        <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
                      ) : (
                        <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>
                      )}
                    </svg>
                    <span>{homeLightMode ? 'Dark mode' : 'Light mode'}</span>
                  </button>
                  <AccessibilityToggles onDark={!homeLightMode} compact />
                </div>
              </nav>
            ) : (
              <Nav />
            )}
          </div>
        </header>
      </div>
      <main className="flex-1">
        <div className={`container-shell${isHome ? ' container-shell--home' : ''}`}>
          {children}
        </div>
      </main>
      <footer className="mx-auto mt-1 max-w-2xl pt-1 pb-3 text-center font-normal">
        <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
          Medical Disclaimer
        </div>
        <div className="flex flex-col gap-1 text-[0.6875rem] leading-normal text-slate-500">
          <p>This tool provides general education and navigation support.</p>
          <p>
            It does not diagnose, provide individualized medical decisions,
            recommend medication changes, or replace care from your clinicians.
          </p>
          <p className="mt-1 font-medium text-slate-500">
            If you have severe symptoms, chest pain, difficulty breathing,
            fainting, or thoughts of self-harm, seek emergency care immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
