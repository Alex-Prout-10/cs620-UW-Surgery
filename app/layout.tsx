import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Manrope } from 'next/font/google';
import Nav from '@/components/Nav';
import PiiWarningModal from '@/components/PiiWarningModal';


const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serum',
  display: 'swap'
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Adrenal Nodule Clinic Navigator',
  description: 'A patient-facing guide for incidental adrenal nodules.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <PiiWarningModal />
        <div className="page-shell">
          <div className="bg-uwred text-white text-center text-sm py-1.5 px-4">
            UW Endocrine Surgery Clinic: <a href="tel:+16082422888" className="font-semibold underline underline-offset-2 hover:no-underline">(608) 242-2888</a>
          </div>
          <header className="sticky top-0 z-40 border-b-2 border-uwred bg-white/90 backdrop-blur">
            <div className="container-shell py-4 md:py-5">
              <Nav />
            </div>
          </header>
          <main className="flex-1">
            <div className="container-shell">{children}</div>
          </main>
          <footer className="mt-8 border-t border-slate-100 pt-4 pb-2 max-w-2xl mx-auto text-center font-normal">
            <div className="text-[10px] text-slate-400 tracking-wide uppercase font-semibold mb-1">
              Medical Disclaimer
            </div>
            <div className="flex flex-col gap-1 text-[11px] leading-normal text-slate-400 font-normal">
              <p>
                This tool provides general education and navigation support.
              </p>
              <p>
                It does not diagnose, provide individualized medical decisions, recommend medication changes, or replace care from your clinicians.
              </p>
              <p className="mt-1 text-slate-500 font-medium">
                If you have severe symptoms, chest pain, difficulty breathing, fainting, or thoughts of self-harm, seek emergency care immediately.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
