import { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { LandingCTAButton } from '@/components/marketing/LandingCTAButton';

export const metadata: Metadata = {
  title: 'NCLEX-RN Prep - Papermind',
  description:
    'Prepare for the NCLEX-RN with AI-powered flashcards, quizzes, and mock exams built from your nursing notes and textbooks.',
};

const features = [
  {
    title: 'Flashcards from your notes',
    description:
      'Upload lecture slides, Saunders review chapters, or your own study guides. Papermind turns them into clear, review-ready flashcards in seconds.',
  },
  {
    title: 'NCLEX-style quizzes',
    description:
      'Practice with adaptive quizzes that focus on the topics you miss — pharmacology, prioritization, safety, and more.',
  },
  {
    title: 'Timed mock exams',
    description:
      'Run full-length practice sessions sourced from your material so you build stamina and confidence before test day.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Upload your nursing material',
    description: 'Drop in PDFs from class, review books, or clinical notes — anything you are already studying from.',
  },
  {
    step: '02',
    title: 'Get a complete study set',
    description: 'Papermind generates flashcards, quizzes, and a mock exam tailored to your uploaded content.',
  },
  {
    step: '03',
    title: 'Review weak areas and pass',
    description: 'Track what you miss, drill those topics again, and walk into the NCLEX-RN ready.',
  },
];

export default function NclexRnPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 md:py-24">
        <section className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Use Case</p>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 tracking-tight leading-tight">
            Pass the <span className="text-[#FF5392]">NCLEX-RN</span> with confidence
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            Turn your nursing notes into flashcards, quizzes, and mock exams — so you spend less time organizing and more time actually studying.
          </p>
          <LandingCTAButton
            eventName="nclex_rn_hero_cta_clicked"
            className="pink-glowing-button group relative rounded-[10px] inline-flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[12px_28px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
          >
            <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
              <span className="blurred-border absolute inset-0 z-20" />
            </span>
            <span className="relative z-30">Start studying for free</span>
          </LandingCTAButton>
        </section>

        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Built for nursing students</h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto">
              NCLEX prep is a volume problem — thousands of concepts, limited time. Papermind helps you move faster without cutting corners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#FF5392]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 font-sans text-sm leading-relaxed text-left">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 font-sans">Three steps from your notes to exam-ready practice.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((item) => (
              <div key={item.step} className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Step {item.step}</p>
                <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 font-sans text-sm leading-relaxed text-left">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                AR
              </div>
              <div>
                <p className="text-gray-700 font-sans leading-relaxed italic">
                  &ldquo;NCLEX prep used to feel impossible. Papermind broke everything down into digestible quizzes and I felt so prepared on exam day.&rdquo;
                </p>
                <p className="text-sm text-gray-500 font-sans mt-3">Aisha R. · @aishanurse</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gray-900 rounded-[28px] border-[2.5px] border-gray-700 p-12 md:p-20 relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 relative z-10">
              Ready to start your NCLEX-RN prep?
            </h2>
            <p className="text-gray-400 font-sans mb-8 max-w-xl mx-auto relative z-10">
              Upload your first PDF and get a full study set in under a minute.
            </p>
            <div className="flex justify-center relative z-10">
              <LandingCTAButton
                eventName="nclex_rn_footer_cta_clicked"
                className="pink-glowing-button group relative rounded-[10px] flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[12px_28px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
              >
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
                <span className="relative z-30">Get started for free</span>
              </LandingCTAButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
