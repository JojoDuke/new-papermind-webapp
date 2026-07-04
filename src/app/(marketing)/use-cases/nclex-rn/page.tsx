import { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { LandingCTAButton } from '@/components/marketing/LandingCTAButton';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('/use-cases/nclex-rn', {
  title: 'NCLEX-RN Prep: AI Flashcards, Quizzes & Mock Exams | Papermind',
  description:
    'NCLEX-RN prep that accelerates retention: generate 200+ AI flashcards from your PDFs, run adaptive quizzes, and take mock exams built from your nursing notes.',
});

const features = [
  {
    title: 'Flashcards from your notes',
    description:
      'Upload lecture slides, Saunders review chapters, or your own study guides. Papermind generates 200+ review-ready flashcards from a single PDF in under 60 seconds.',
  },
  {
    title: 'NCLEX-style quizzes',
    description:
      'Practice with adaptive quizzes that focus on the topics you miss — pharmacology, prioritization, safety, and more — through AI-generated active recall loops.',
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
    description:
      'Drop in PDFs from class, review books, or clinical notes — anything you are already studying from.',
  },
  {
    step: '02',
    title: 'Get a complete study set',
    description:
      'Papermind generates flashcards, quizzes, and a mock exam tailored to your uploaded content.',
  },
  {
    step: '03',
    title: 'Review weak areas and pass',
    description:
      'Track what you miss, drill those topics again, and walk into the NCLEX-RN ready.',
  },
];

const faqs = [
  {
    question: 'How many questions are on the NCLEX-RN in 2024?',
    answer:
      'The NCLEX-RN uses a computerized adaptive testing (CAT) format, so the number of questions varies. Most candidates answer between 75 and 145 questions. The exam continues until the algorithm determines with 95% confidence that you are above or below the passing standard, or until you reach the maximum of 145 questions or the five-hour time limit.',
  },
  {
    question: 'How long should I study for the NCLEX-RN?',
    answer:
      'Most nursing graduates spend four to eight weeks in dedicated NCLEX-RN prep after completing their program. Candidates who use active recall and spaced repetition typically retain more in less time than those who rely on passive re-reading. Papermind helps you compress that timeline by turning your existing notes into daily practice sessions without manual flashcard creation.',
  },
  {
    question: 'Can I use Papermind alongside ATI or HESI prep?',
    answer:
      'Yes. Papermind complements ATI, HESI, Kaplan, and UWorld rather than replacing them. Upload PDFs from any prep platform or your nursing program and Papermind will generate supplemental flashcards and quizzes targeting your specific weak areas — filling gaps that generic question banks cannot address.',
  },
  {
    question: 'What topics does the NCLEX-RN cover?',
    answer:
      'The NCLEX-RN tests four major Client Needs categories defined by the NCSBN: Safe and Effective Care Environment, Health Promotion and Maintenance, Psychosocial Integrity, and Physiological Integrity. Within those categories, expect heavy emphasis on pharmacology, prioritization, infection control, and clinical judgment — all areas Papermind can drill through adaptive quizzing.',
  },
  {
    question: 'Is Papermind enough to pass the NCLEX-RN on its own?',
    answer:
      'Papermind is most effective as a personalized active-recall layer on top of your existing study materials. It excels at converting your Saunders chapters, lecture notes, and clinical guides into flashcards and mock exams. For comprehensive NCLEX-RN prep, combine Papermind with a structured review course or question bank, then use Papermind to reinforce the topics you miss.',
  },
  {
    question: 'How quickly can I generate study materials from my PDFs?',
    answer:
      'Papermind generates a complete study set — flashcards, quizzes, and a mock exam — from a single uploaded PDF in under 60 seconds. There is no manual formatting required. Upload your file, and the AI extracts key nursing concepts and builds your review session automatically.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const comparisonRows = [
  { feature: 'Content source', papermind: 'Your own PDFs & nursing notes', kaplan: 'Pre-built review library', uworld: 'Pre-built question bank' },
  { feature: 'Flashcard generation', papermind: 'AI — 200+ cards in under 60 sec', kaplan: 'Manual or limited templates', uworld: 'Not included' },
  { feature: 'Adaptive quizzing', papermind: 'Yes, from your uploaded material', kaplan: 'Yes, from fixed curriculum', uworld: 'Yes, from fixed question bank' },
  { feature: 'Mock exams', papermind: 'Generated from your notes', kaplan: 'Structured practice tests', uworld: 'NCLEX-style simulations' },
  { feature: 'Pricing', papermind: 'Free tier available', kaplan: 'Premium subscription ($400+)', uworld: 'Premium subscription ($200–400)' },
  { feature: 'Best for', papermind: 'Customizing prep from class material', kaplan: 'Guided review course structure', uworld: 'High-volume NCLEX-style questions' },
];

export default function NclexRnPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 md:py-24">
        <section className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Use Case</p>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 tracking-tight leading-tight">
            NCLEX-RN Prep: Pass Your{' '}
            <span className="text-[#FF5392]">Nursing Boards</span> with Confidence
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            Turn your nursing notes into AI flashcards, adaptive quizzes, and mock exams — so you spend less time
            organizing and more time in active recall that actually sticks.
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
          <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-6 text-left">
              Why NCLEX-RN is one of the hardest nursing exams
            </h2>
            <div className="space-y-5 text-gray-600 font-sans leading-relaxed text-left">
              <p>
                The NCLEX-RN is not a content recall test — it is a clinical judgment exam that evaluates whether
                you can make safe nursing decisions under pressure. The National Council of State Boards of Nursing
                (NCSBN) redesigned the exam around the Next Generation NCLEX (NGN) framework, adding case studies,
                bow-tie items, and extended multiple-response questions that mirror real clinical scenarios.
              </p>
              <p>
                The stakes are high and the pass rates reflect it.{' '}
                <a
                  href="https://www.ncsbn.org/publications/annual-pass-rate-report"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF5392] underline underline-offset-2 hover:text-[#e0457a]"
                >
                  The NCLEX-RN pass rate for first-time U.S.-educated candidates was 82.5% in 2023 (NCSBN, 2024)
                </a>
                , meaning nearly 1 in 5 candidates fails on their first attempt. International-educated candidates
                face even lower first-time pass rates, often below 45%.
              </p>
              <p>
                The exam covers four Client Needs categories — Safe and Effective Care Environment, Health Promotion
                and Maintenance, Psychosocial Integrity, and Physiological Integrity — spanning pharmacology,
                prioritization, infection control, and delegation. Most candidates need to internalize thousands of
                discrete facts while also practicing the clinical reasoning the CAT algorithm is designed to measure.
                That volume, combined with adaptive difficulty, is what makes NCLEX-RN prep one of the most demanding
                study challenges in healthcare education.
              </p>
              <p>
                Effective NCLEX-RN prep requires more than memorizing lab values and drug classifications. You need
                repeated exposure to clinical scenarios, timed practice under exam conditions, and a system that
                identifies your weak Client Needs categories before test day — not after a failed attempt.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Built for nursing students</h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto">
              NCLEX-RN prep is a volume problem — thousands of concepts, limited time. Papermind accelerates retention
              through AI-generated active recall loops so you move faster without cutting corners.
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
          <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-6 text-left">
              How AI-powered study tools improve NCLEX pass rates
            </h2>
            <div className="space-y-5 text-gray-600 font-sans leading-relaxed text-left">
              <p>
                Decades of cognitive science research confirm that how you study matters as much as how long you study.
                Three evidence-based techniques consistently outperform passive re-reading for licensure exams: active
                recall, spaced repetition, and adaptive quizzing.
              </p>

              <h3 className="text-xl font-bold font-serif text-gray-900 pt-2">Active recall</h3>
              <p>
                Active recall forces your brain to retrieve information from memory rather than recognize it on a page.
                {' '}
                <a
                  href="https://www.sciencedirect.com/journal/nurse-education-today"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF5392] underline underline-offset-2 hover:text-[#e0457a]"
                >
                  A 2021 meta-analysis in Nurse Education Today found that active recall techniques improved exam
                  performance by up to 35% compared to passive re-reading
                </a>
                . Papermind applies this principle automatically — every flashcard and quiz question requires retrieval,
                not recognition.
              </p>

              <h3 className="text-xl font-bold font-serif text-gray-900 pt-2">Spaced repetition</h3>
              <p>
                Spaced repetition schedules review sessions at increasing intervals, reinforcing memories just before
                they fade. Research published in{' '}
                <a
                  href="https://www.nature.com/articles/npjscilearn201613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF5392] underline underline-offset-2 hover:text-[#e0457a]"
                >
                  npj Science of Learning
                </a>{' '}
                demonstrates that spaced practice can double long-term retention compared to massed study sessions.
                Papermind surfaces the topics you miss most frequently, creating a personalized spaced-repetition
                schedule without manual calendar planning.
              </p>

              <h3 className="text-xl font-bold font-serif text-gray-900 pt-2">Adaptive quizzing</h3>
              <p>
                The NCLEX-RN itself is an adaptive exam — it adjusts question difficulty based on your performance.
                Practicing with adaptive quizzes mirrors that experience and concentrates your study time on weak
                areas. Rather than reviewing pharmacology for the tenth time when you already score 90%, adaptive
                quizzing redirects effort toward prioritization, delegation, or whichever Client Needs category is
                dragging your score down.
              </p>
              <p>
                Together, these three methods address the core challenge of NCLEX-RN prep: retaining a massive volume
                of nursing knowledge while building the clinical judgment the exam actually tests. AI study tools like
                Papermind automate all three, removing the manual overhead that causes most candidates to fall back on
                inefficient re-reading.
              </p>
            </div>
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

        <section className="mb-24">
          <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4 text-left">
              What makes Papermind different from Kaplan and UWorld
            </h2>
            <p className="text-gray-600 font-sans leading-relaxed text-left mb-8">
              Kaplan and UWorld are established NCLEX-RN prep platforms with large question banks and structured review
              courses. Papermind fills a different gap: it turns <em>your</em> nursing material into personalized study
              tools in seconds. Many students use all three — a question bank for breadth, a review course for structure,
              and Papermind for targeted active recall on the topics they personally struggle with.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b-[2.5px] border-gray-200">
                    <th className="text-left py-3 pr-4 font-bold text-gray-900">Feature</th>
                    <th className="text-left py-3 pr-4 font-bold text-[#FF5392]">Papermind</th>
                    <th className="text-left py-3 pr-4 font-bold text-gray-900">Kaplan</th>
                    <th className="text-left py-3 font-bold text-gray-900">UWorld</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-900 align-top">{row.feature}</td>
                      <td className="py-3 pr-4 text-gray-600 align-top">{row.papermind}</td>
                      <td className="py-3 pr-4 text-gray-600 align-top">{row.kaplan}</td>
                      <td className="py-3 text-gray-600 align-top">{row.uworld}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 font-sans leading-relaxed text-left mt-8">
              If you already own a Kaplan course or UWorld subscription, keep using them for structured coverage and
              high-volume question practice. Add Papermind when you want to convert a specific Saunders chapter, ATI
              module, or lecture PDF into targeted flashcards without spending hours on manual card creation. Most
              successful candidates combine a primary prep platform with a personalized active-recall tool — exactly
              the workflow Papermind is built for.
            </p>
          </div>
        </section>

        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">
              Frequently Asked Questions about NCLEX-RN Prep
            </h2>
            <p className="text-gray-500 font-sans max-w-2xl mx-auto">
              Clear answers to the questions nursing graduates ask most before exam day.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8"
              >
                <h3 className="text-lg font-bold font-serif text-gray-900 mb-3 text-left">{faq.question}</h3>
                <p className="text-gray-600 font-sans text-sm leading-relaxed text-left">{faq.answer}</p>
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
              Upload your first PDF and get a full study set — 200+ flashcards, adaptive quizzes, and a mock exam — in under 60 seconds.
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
