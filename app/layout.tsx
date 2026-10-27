import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";
import PiiWarningModal from "@/components/PiiWarningModal";
import RouteShell from "@/components/RouteShell";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serum",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adrenal Nodule Clinic Navigator",
  description: "A patient-facing guide for incidental adrenal nodules.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <PiiWarningModal />
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
