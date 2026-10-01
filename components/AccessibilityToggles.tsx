'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'navigator_accessibility';

type AccessibilityState = {
  highContrast: boolean;
  largeText: boolean;
};

export default function AccessibilityToggles() {
  const [state, setState] = useState<AccessibilityState>({
    highContrast: false,
    largeText: false
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        setState({
          highContrast: parsed.highContrast === true,
          largeText: parsed.largeText === true
        });
      }
    } catch {
      setState({ highContrast: false, largeText: false });
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    const root = document.documentElement;
    root.classList.toggle('high-contrast', state.highContrast);
    root.classList.toggle('large-text', state.largeText);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The controls still work for this page view if storage is unavailable.
    }
  }, [preferencesLoaded, state]);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        aria-pressed={state.highContrast}
        onClick={() => setState((prev) => ({ ...prev, highContrast: !prev.highContrast }))}
        className={`rounded-full border px-3 py-1 ${
          state.highContrast ? 'border-uwred bg-uwred text-white' : 'border-accent text-darkgray'
        }`}
      >
        High contrast
      </button>
      <button
        type="button"
        aria-pressed={state.largeText}
        onClick={() => setState((prev) => ({ ...prev, largeText: !prev.largeText }))}
        className={`rounded-full border px-3 py-1 ${
          state.largeText ? 'border-uwred bg-uwred text-white' : 'border-accent text-darkgray'
        }`}
      >
        Large text
      </button>
    </div>
  );
}
