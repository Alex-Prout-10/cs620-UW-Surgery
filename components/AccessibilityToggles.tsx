'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'navigator_accessibility';

type AccessibilityState = {
  largeText: boolean;
};

export default function AccessibilityToggles({
  onDark = false,
  compact = false
}: {
  onDark?: boolean;
  compact?: boolean;
}) {
  const [state, setState] = useState<AccessibilityState>({
    largeText: false
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        setState({ largeText: parsed.largeText === true });
      }
    } catch {
      setState({ largeText: false });
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    const root = document.documentElement;
    root.classList.toggle('large-text', state.largeText);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The controls still work for this page view if storage is unavailable.
    }
  }, [preferencesLoaded, state]);

  const inactiveButton = onDark
    ? 'border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/5'
    : 'border-accent text-darkgray hover:border-uwred/50';

  return (
    <div className={`accessibility-toggles flex flex-wrap items-center gap-2 ${compact ? 'text-[0.6875rem]' : 'text-xs'}`}>
      <button
        type="button"
        aria-label="Large text"
        title="Large text"
        aria-pressed={state.largeText}
        onClick={() => setState((prev) => ({ ...prev, largeText: !prev.largeText }))}
        className={`rounded-full border px-2.5 py-1 transition-colors ${
          state.largeText ? 'border-uwred bg-uwred text-white' : inactiveButton
        }`}
      >
        Large text
      </button>
    </div>
  );
}
