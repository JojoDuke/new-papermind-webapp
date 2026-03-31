import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const testimonials = [
  {
    name: 'Sarah K.',
    handle: '@sarahkmed',
    initials: 'SK',
    color: 'bg-pink-100 text-pink-600',
    text: 'I uploaded my entire anatomy textbook and had 200 flashcards ready in 2 minutes. Passed my USMLE Step 1 on the first try.',
  },
  {
    name: 'James T.',
    handle: '@jamescfa',
    initials: 'JT',
    color: 'bg-blue-100 text-blue-600',
    text: 'Papermind turned my 400-page CFA study guide into a full mock exam in seconds. The adaptive quizzes are insane.',
  },
  {
    name: 'Priya M.',
    handle: '@priyalaw',
    initials: 'PM',
    color: 'bg-purple-100 text-purple-600',
    text: "Used it for my finals at Cambridge. It picked up on exactly the concepts my professor kept emphasising. It's like it read the room.",
  },
  {
    name: 'Daniel O.',
    handle: '@danieloxford',
    initials: 'DO',
    color: 'bg-emerald-100 text-emerald-600',
    text: "Honestly didn't think AI study tools could be this good. I went from failing mocks to passing my finals with a first.",
  },
  {
    name: 'Aisha R.',
    handle: '@aishanurse',
    initials: 'AR',
    color: 'bg-orange-100 text-orange-600',
    text: 'NCLEX prep used to feel impossible. Papermind broke everything down into digestible quizzes and I felt so prepared on exam day.',
  },
  {
    name: 'Tom W.',
    handle: '@tomacca',
    initials: 'TW',
    color: 'bg-indigo-100 text-indigo-600',
    text: 'I have a full-time job and was studying for my ACCA exams at night. Papermind saved me hours every single week.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 text-center">

        {/* ── Hero ── */}
        <div className="text-center max-w-4xl mx-auto pt-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-serif tracking-tight">
            The Fastest Way to Pass Your Next Exam
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            From university finals to professional certifications, create AI-powered flashcards, quizzes, and mock exams, ready in seconds.
          </p>
          <div className="flex justify-center mb-16">
            <Link
              href="/auth"
              className="pink-glowing-button group relative rounded-[10px] flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[10px_20px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
            >
              <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                <span className="blurred-border absolute inset-0 z-20" />
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-laptop pointer-events-none z-30" aria-hidden="true">
                <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" />
                <path d="M20.054 15.987H3.946" />
              </svg>
              <span className="relative z-30">Start Studying — It&apos;s free</span>
            </Link>
          </div>
        </div>

        {/* ── App Preview ── */}
        <div className="mt-8 relative w-full group">
          <div className="absolute -inset-1 bg-linear-to-r from-pink-200 to-purple-200 rounded-[24px] blur-xl opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-white border border-white/40 shadow-2xl rounded-[20px] overflow-hidden backdrop-blur-sm aspect-video flex items-center justify-center">
            <img
              src="/assets/webapp_preview_screenshot.png"
              alt="Papermind Webapp Preview"
              className="w-full h-full object-cover rounded-[18px]"
            />
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ── Trust Bar ── */}
        <div className="mt-20 w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by students preparing for the world&apos;s most competitive exams
          </p>
          <div className="relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-24 bg-linear-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee items-center gap-16 w-max">
              {([
                { type: 'img', src: '/trust-logos/oxford.svg',   alt: 'University of Oxford',    height: 'h-7'  },
                { type: 'img', src: '/trust-logos/cambridge.svg',alt: 'University of Cambridge',  height: 'h-9'  },
                { type: 'img', src: '/trust-logos/mit.svg',      alt: 'MIT',                      height: 'h-6'  },
                { type: 'img', src: '/trust-logos/imperial.svg', alt: 'Imperial College London',  height: 'h-7'  },
                { type: 'img', src: '/trust-logos/usmle.png',   alt: 'USMLE',                    height: 'h-10' },
                { type: 'img', src: '/trust-logos/cfa.svg',      alt: 'CFA Institute',            height: 'h-8'  },
                { type: 'img', src: '/trust-logos/acca.svg',     alt: 'ACCA',                     height: 'h-8'  },
                { type: 'txt', name: 'NCLEX', style: 'font-sans font-bold tracking-widest text-base' },
                { type: 'img', src: '/trust-logos/oxford.svg',   alt: 'University of Oxford',    height: 'h-7'  },
                { type: 'img', src: '/trust-logos/cambridge.svg',alt: 'University of Cambridge',  height: 'h-9'  },
                { type: 'img', src: '/trust-logos/mit.svg',      alt: 'MIT',                      height: 'h-6'  },
                { type: 'img', src: '/trust-logos/imperial.svg', alt: 'Imperial College London',  height: 'h-7'  },
                { type: 'img', src: '/trust-logos/usmle.png',   alt: 'USMLE',                    height: 'h-10' },
                { type: 'img', src: '/trust-logos/cfa.svg',      alt: 'CFA Institute',            height: 'h-8'  },
                { type: 'img', src: '/trust-logos/acca.svg',     alt: 'ACCA',                     height: 'h-8'  },
                { type: 'txt', name: 'NCLEX', style: 'font-sans font-bold tracking-widest text-base' },
              ] as Array<
                | { type: 'img'; src: string; alt: string; height: string }
                | { type: 'txt'; name: string; style: string }
              >).map((item, i) =>
                item.type === 'img' ? (
                  <img key={i} src={item.src} alt={item.alt} className={`${item.height} w-auto object-contain select-none grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500`} />
                ) : (
                  <span key={i} className={`text-gray-300 hover:text-blue-500 whitespace-nowrap select-none transition-colors duration-500 ${item.style}`}>{item.name}</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="mt-32 text-left">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Everything you need to ace your exams</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-sans">Upload your material once. Papermind handles the rest.</p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Large card — Upload & Generate */}
            <div className="md:col-span-2 bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 flex flex-col gap-6 overflow-hidden relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Upload &amp; Generate</p>
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-3">Turn any PDF into a full study set</h3>
                <p className="text-gray-500 font-sans leading-relaxed">Upload lecture slides, textbooks, or revision notes — Papermind reads your material and instantly builds a complete set of flashcards, quizzes, and a mock exam. No manual work, no copy-pasting.</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {['Flashcards', 'Quizzes', 'Mock Exams', 'Summaries'].map(tag => (
                  <span key={tag} className="text-xs font-medium bg-pink-50 text-[#FF5392] px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* AI Quiz Mode */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 flex flex-col gap-4 relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">AI Quiz Mode</p>
              <h3 className="text-xl font-bold font-serif text-gray-900">Test yourself the smart way</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed">Adaptive quizzes that track what you get wrong and automatically serve those topics again — so every study session compounds.</p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Mock Exams */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 flex flex-col gap-4 relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mock Exams</p>
              <h3 className="text-xl font-bold font-serif text-gray-900">Simulate the real thing</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed">Full timed mock exams built directly from your material — formatted like the actual test so there are no surprises on exam day.</p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Progress Tracking */}
            <div className="md:col-span-2 bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 flex flex-col gap-4 relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Progress Tracking</p>
              <h3 className="text-xl font-bold font-serif text-gray-900">Know exactly where you stand</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed max-w-lg">Papermind tracks your scores across every topic and shows you exactly which areas need more work — so you study smarter, not longer.</p>
              <div className="mt-auto flex gap-6">
                {[
                  { label: 'Topics mastered', value: '84%' },
                  { label: 'Weak areas', value: '3' },
                  { label: 'Study streak', value: '12 days' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold font-serif text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-sans">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>

          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="mt-32 text-left">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Ready to study in under a minute</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-sans">Three steps. No setup. No learning curve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                color: 'text-[#FF5392]',
                bg: 'bg-pink-50',
                title: 'Upload your material',
                desc: 'Drop in a PDF, paste text, or upload lecture slides. Papermind accepts anything you study from.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                ),
              },
              {
                step: '02',
                color: 'text-purple-500',
                bg: 'bg-purple-50',
                title: 'Papermind generates',
                desc: 'In seconds, the AI creates flashcards, a quiz set, and a full mock exam — all tailored to your exact material.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ),
              },
              {
                step: '03',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
                title: 'Study and pass',
                desc: 'Work through your personalised study set, track your weak spots, and walk into exam day fully prepared.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ),
              },
            ].map(({ step, color, bg, title, desc, icon }) => (
              <div key={step} className="flex flex-col gap-5">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  {icon}
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${color} mb-2`}>Step {step}</p>
                  <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 font-sans text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mt-32">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-8 md:gap-0">
              {[
                { value: '10,000+', label: 'Students worldwide', color: 'text-[#FF5392]' },
                { value: '1M+',     label: 'Flashcards created',  color: 'text-purple-500' },
                { value: '4.5 hrs', label: 'Saved per exam on average', color: 'text-emerald-500' },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-2 px-8 py-4 md:py-0">
                  <p className={`text-5xl font-black font-serif ${color}`}>{value}</p>
                  <p className="text-sm text-gray-400 font-sans text-center">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="mt-32 text-left">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Loved by Students</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Join thousands who already passed</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-sans">Real students. Real exams. Real results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.handle} className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold font-sans`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-sans">{t.name}</p>
                    <p className="text-xs text-gray-400 font-sans">{t.handle}</p>
                  </div>
                  <svg className="ml-auto text-gray-200" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-sans leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="mt-32 text-left">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto font-sans">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Free */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-400 font-sans mb-1">Free</p>
                <p className="text-5xl font-black font-serif text-gray-900">£0</p>
                <p className="text-sm text-gray-400 font-sans mt-1">Forever free</p>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  '3 uploads per month',
                  'Flashcard generation',
                  'Basic quiz mode',
                  'Up to 50 cards per set',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-auto w-full text-center py-3 rounded-[10px] border border-gray-200 text-gray-700 font-medium text-sm font-sans hover:border-gray-300 hover:bg-gray-50 transition-all">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 rounded-[20px] p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-semibold bg-[#FF5392] text-white px-3 py-1 rounded-full font-sans">Most popular</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-400 font-sans mb-1">Pro</p>
                <div className="flex items-end gap-1">
                  <p className="text-5xl font-black font-serif text-white">£9</p>
                  <p className="text-gray-400 font-sans text-sm mb-2">/month</p>
                </div>
                <p className="text-sm text-gray-400 font-sans mt-1">Cancel anytime</p>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Unlimited uploads',
                  'Flashcards, quizzes & mock exams',
                  'Adaptive AI quiz mode',
                  'Unlimited cards per set',
                  'Progress tracking & analytics',
                  'Priority AI processing',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="pink-glowing-button group relative mt-auto w-full text-center py-3 rounded-[10px] text-white font-medium text-sm font-sans transition-all active:scale-95 outline-none focus:outline-none">
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
                <span className="relative z-30">Start Pro — first 7 days free</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mt-32 mb-8">
          <div className="relative bg-gray-900 rounded-[24px] overflow-hidden px-8 py-20 text-center">
            {/* Background glow blobs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-4 relative z-10">Get started today</p>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4 relative z-10">
              Ace your next exam — starting now
            </h2>
            <p className="text-lg text-gray-400 font-sans mb-10 max-w-lg mx-auto relative z-10">
              Join thousands of students already using Papermind to study smarter and pass faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                href="/auth"
                className="pink-glowing-button group relative rounded-[10px] flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[12px_28px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
              >
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
                <span className="relative z-30">Start Studying — It&apos;s free</span>
              </Link>
              <p className="text-sm text-gray-500 font-sans">No credit card required &nbsp;·&nbsp; Cancel anytime</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
