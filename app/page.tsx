import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section aria-labelledby="about-chatbot-heading" className="card fade-in">
        <div className="rounded-2xl border border-uwred/15 bg-gradient-to-br from-uwred/[0.07] via-white to-rose-50/80 p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-uwred">UW Endocrinology Resource</p>
          <h2 id="about-chatbot-heading" className="mt-1 font-serif text-3xl text-darkgray">About this chatbot</h2>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted">
            The Adrenal Nodule Chatbot is curated and endorsed by the UW Adrenal Nodule team. It helps you understand adrenal nodules and prepare for conversations with your care team. Answers draw on selected UW Health education materials and established clinical guidelines, with sources available alongside answers when applicable.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            {
              number: '01',
              title: 'What it can help with',
              description: 'Get general explanations about adrenal nodules, hormone tests, imaging, follow-up, and treatment discussions. It can also help you prepare questions for an appointment.'
            },
            {
              number: '02',
              title: 'How to use it',
              description: 'Ask one clear question at a time, choose a common question for a prepared answer, and ask follow-ups when you want more detail. Open Sources beneath an answer to review its references.'
            },
            {
              number: '03',
              title: 'Focused and source-based',
              description: 'Unlike general-purpose commercial chatbots, this tool is designed for adrenal nodule education and uses a selected health information library rather than searching the open internet.'
            },
            {
              number: '04',
              title: 'A guide, not a diagnosis',
              description: 'It cannot see your medical record or decide which tests or treatment are right for you. Your care team can interpret your results in context. For a medical emergency, call 911.'
            }
          ].map((item) => (
            <article key={item.number} className="group rounded-2xl border border-uwred/15 bg-gradient-to-br from-white via-white to-rose-50/80 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-uwred/30 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-uwred/[0.09] font-serif text-sm font-bold text-uwred ring-4 ring-uwred/[0.04]">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-darkgray">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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

      <section id="lab-testing-resources" className="card fade-in scroll-mt-24">
        <div className="rounded-2xl border border-uwred/15 bg-gradient-to-br from-uwred/[0.07] via-white to-rose-50/80 p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-uwred">Preparing for your care</p>
          <h2 className="mt-1 font-serif text-3xl text-darkgray">Lab Testing Resources</h2>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted">
            If your care team has ordered morning adrenal hormone testing, these steps can help you prepare. Follow any instructions given to you by your own care team.
          </p>
        </div>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { step: '1', title: 'Prepare for the test', desc: 'Schedule a blood draw for 8am at your nearest blood draw facility. Pick up the medication dexamethasone, which will be prescribed for you.' },
            { step: '2', title: 'The night before', desc: 'Take the dexamethasone at 11pm the night before your blood draw. You can take your other medications as normal.' },
            { step: '3', title: 'Day of the tests', desc: 'Arrive before 8am to get your blood drawn right at 8am. It is okay to eat breakfast, although avoid coffee if you can.' },
            { step: '4', title: 'After the tests', desc: 'A provider will reach out to discuss results. If they are abnormal, they will arrange a visit with a surgeon to discuss treatment. If they are normal, they can discuss what follow-up, if any, is recommended.' }
          ].map((item) => (
            <li key={item.step} className="group rounded-2xl border border-uwred/15 bg-gradient-to-br from-white via-white to-rose-50/80 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-uwred/30 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-uwred/[0.09] font-serif text-sm font-bold text-uwred ring-4 ring-uwred/[0.04]">{item.step.padStart(2, '0')}</span>
                <div>
                  <h3 className="font-serif text-lg text-darkgray">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
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
