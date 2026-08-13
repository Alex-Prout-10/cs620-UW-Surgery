import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid gap-6">
      {/* Educational Video Section */}
      <section className="card fade-in overflow-hidden p-0">
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-serif text-xl text-darkgray">Understanding Your Adrenal Nodule</h2>
          <p className="mt-1 text-sm text-muted">Watch this short overview from the UW Endocrine Surgery team about what an adrenal nodule is and what to expect.</p>
        </div>
        <video
          controls
          playsInline
          preload="metadata"
          className="w-full"
          poster="/poster.png"
        >
          <source src="https://0qduonpuurottffe.public.blob.vercel-storage.com/Patient%20adrenal%20copy.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      {/* Care Pathway Section */}
      <section className="card fade-in">
        <h2 className="font-serif text-xl text-darkgray">Your Usual Care Pathway</h2>
        <p className="mt-1 text-sm text-muted">
          Here is what typically happens after an adrenal nodule is found. Your care team will guide you through each step.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', title: 'Nodule Found', desc: 'An adrenal nodule is discovered on imaging done for another reason. Your doctor reviews the scan.' },
            { step: '2', title: 'Hormone Testing', desc: 'Blood and sometimes urine tests check whether the nodule is making extra hormones. Your doctor orders these.' },
            { step: '3', title: 'Results Review', desc: 'Your care team reviews test results and imaging to determine if the nodule needs further action or monitoring.' },
            { step: '4', title: 'Next Steps', desc: 'Based on results, you may be monitored with follow-up imaging, referred to a specialist, or reassured that no further action is needed.' }
          ].map((item) => (
            <li key={item.step} className="flex gap-3 rounded-xl border border-accent/60 bg-white/70 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-uwred text-xs font-bold text-white">{item.step}</span>
              <div>
                <div className="text-sm font-semibold text-darkgray">{item.title}</div>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card fade-in">
        <h2 className="font-serif text-xl text-darkgray">Lab Testing Resources</h2>
        <p className="mt-1 text-sm text-muted">
          Review this guide to understand the lab tests that may be part of your adrenal nodule evaluation.
        </p>
        <div className="relative mt-4 overflow-hidden rounded-xl border border-accent/60 bg-white">
          <iframe
            src="/pdfjs-viewer.html?file=%2Fadrenal-lab-testing-guide.pdf&scale=0.58"
            title="Lab Testing Guide preview"
            className="pointer-events-none h-[500px] w-full border-0"
          />
          <a
            href="/adrenal-lab-testing-guide.pdf"
            target="_blank"
            rel="noreferrer"
            aria-label="Open the Lab Testing Guide PDF in full size"
            className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/25 via-transparent to-transparent p-5"
          >
            <span className="rounded-full bg-white/95 px-5 py-2 text-sm font-semibold text-uwred shadow-md transition hover:bg-uwred hover:text-white">
              Open full-size lab testing guide
            </span>
          </a>
        </div>
        <div className="mt-4">
          <a
            href="/adrenal-lab-testing-guide.docx"
            download
            className="group flex items-center gap-3 rounded-xl border border-accent/60 bg-white/70 p-4 transition hover:border-uwred/50 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-uwred/10 text-sm font-bold text-uwred">
              DOCX
            </span>
            <span>
              <span className="block text-sm font-semibold text-darkgray group-hover:text-uwred">
                Lab Testing Guide
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                Download the Word document
              </span>
            </span>
          </a>
        </div>
      </section>

      {/* Button to the Chat Page */}
      <div className="mt-4 text-center">
        <Link 
          href="/chat"
          className="inline-block rounded-full bg-uwred px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Start Chatting
        </Link>
      </div>
    </div>
  );
}
