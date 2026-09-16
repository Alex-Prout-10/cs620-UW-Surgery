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

      <section className="card fade-in">
        <h2 className="font-serif text-xl text-darkgray">Lab Testing Resources</h2>
        <p className="mt-1 text-sm text-muted">
          Here is how to prepare if your care team has ordered morning adrenal hormone testing.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', title: 'Prepare for the test', desc: 'Schedule a blood draw for 8am at your nearest blood draw facility. Pick up the medication dexamethasone, which will be prescribed for you.' },
            { step: '2', title: 'The night before', desc: 'Take the dexamethasone at 11pm the night before your blood draw. You can take your other medications as normal.' },
            { step: '3', title: 'Day of the tests', desc: 'Arrive before 8am to get your blood drawn right at 8am. It is okay to eat breakfast, although avoid coffee if you can.' },
            { step: '4', title: 'After the tests', desc: 'A provider will reach out to discuss results. If they are abnormal, they will arrange a visit with a surgeon to discuss treatment. If they are normal, they can discuss what follow-up, if any, is recommended.' }
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
