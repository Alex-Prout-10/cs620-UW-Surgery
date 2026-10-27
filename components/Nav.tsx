'use client';

import Link from 'next/link';
import AccessibilityToggles from '@/components/AccessibilityToggles';

const links = [
  { href: '/', label: 'Home' },
  { href: '/chat', label: 'Chat' }
  // { href: '/checklist', label: 'Checklist' },
  // { href: '/admin/content', label: 'Content' },
  // { href: '/admin/config', label: 'Config' }
];

const resourceLinks = [
  {
    href: 'https://www.uwhealth.org/treatments/endocrine-surgery',
    label: 'UW Endocrine Surgery page'
  },
  {
    href: 'https://www.uwhealth.org/laboratory-services#2aKcLLILK6b8Y2Q4UThgDL',
    label: 'UW Laboratory Services'
  },
  {
    href: '/FINAL-Adrenal-Nodual-Workflow-Flyer.pdf',
    label: 'FINAL Adrenal Nodual Workflow Flyer'
  }
];

export default function Nav({ homeTheme = false }: { homeTheme?: boolean }) {
  return (
    <nav className="site-nav flex flex-col gap-4 md:grid md:grid-cols-[auto,1fr,auto] md:items-center">
      <Link href="/" className="site-nav-brand flex min-w-0 items-center gap-3">
        <img
          src="/uw-madison-emblem.png"
          alt="University of Wisconsin–Madison emblem"
          width={48}
          height={64}
          className="h-14 w-auto shrink-0"
        />
        <div className="min-w-0">
          <span className="site-nav-brand-kicker text-sm uppercase tracking-[0.3em] text-uwred">Adrenal Nodule Clinic Navigator</span>
          <div className="site-nav-brand-title font-serif text-2xl text-darkgray">Patient Guide</div>
        </div>
      </Link>

      <div className="site-nav-links flex flex-wrap gap-3 text-sm md:flex-nowrap md:justify-center">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="site-nav-link rounded-full border border-transparent bg-white/70 px-4 py-2 text-darkgray shadow-sm transition hover:border-uwred hover:bg-white"
          >
            {link.label}
          </Link>
        ))}




        {/* resources dropdown panel */}
        <div className="site-nav-resources group relative -mt-2 pt-2">
          <button
            type="button"
            className="site-nav-link site-nav-resource-button inline-flex items-center rounded-full border border-transparent bg-white/70 px-4 py-2 text-darkgray shadow-sm transition hover:border-uwred hover:bg-white"
          >
            Resources
            <span className="ml-2 text-xs text-darkgray/70">▼</span>
          </button>
          <div className="site-nav-resource-menu invisible pointer-events-none absolute left-0 top-full z-20 w-72 rounded-2xl border border-gray-200 bg-white/95 p-2 text-sm opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
            {resourceLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="site-nav-resource-item block rounded-xl px-3 py-2 text-darkgray transition hover:bg-uwred/10 hover:text-uwred"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="site-nav-controls flex md:justify-end">
        <AccessibilityToggles onDark={homeTheme} compact={homeTheme} />
      </div>
    </nav>
  );
}
