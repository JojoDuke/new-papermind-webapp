import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { LandingCTAButton } from '@/components/marketing/LandingCTAButton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Papermind',
  description: 'Learn about the mission behind Papermind and how we are using AI to reshape the future of accelerated learning.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 md:py-24">
        {/* ── Header ── */}
        <section className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Our Mission</p>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 tracking-tight leading-tight">
            We're building the future of <br className="hidden md:block" /> 
            <span className="text-[#FF5392]">accelerated learning</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Papermind was born out of a simple realization: the way we study hasn't kept up with the speed of information. We're on a mission to help every student and professional master their material in record time.
          </p>
        </section>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold font-serif text-gray-900 mb-4 text-left">The Problem</h2>
              <p className="text-gray-600 font-sans leading-relaxed text-left">
                Modern curricula are exploding in size. Medical students, law candidates, and finance professionals are expected to absorb thousands of pages of complex information in weeks. Traditional methods—manual flashcards, re-reading notes, and highlighting—are slow, inefficient, and prone to burnout.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif text-gray-900 mb-4 text-left">Our Solution</h2>
              <p className="text-gray-600 font-sans leading-relaxed text-left">
                We believe AI shouldn't just answer questions; it should build the structures that help you learn. Papermind uses advanced Large Language Models to dissect your specific study material and instantly generate a customized, adaptive learning environment.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-linear-to-r from-pink-200 to-purple-200 rounded-[30px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white border-[2.5px] border-gray-200 rounded-[24px] p-8 aspect-square flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-[20px] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">1,000,000+</h3>
              <p className="text-gray-500 font-sans">Flashcards generated for students across 50 countries.</p>
            </div>
          </div>
        </div>

        {/* ── Values Bento ── */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">What we stand for</h2>
            <p className="text-gray-500 font-sans">The core principles that guide every feature we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5392" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900">Radical Efficiency</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed text-left">
                If a task can be automated, it should be. We focus on removing the "administrative burden" of studying so you can focus on mastering the material.
              </p>
            </div>
            <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900">Privacy First</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed text-left">
                Your notes and documents are yours. We encrypt everything and never sell your data. Your intellectual property stays private.
              </p>
            </div>
            <div className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900">Empowerment</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed text-left">
                We're not just a tool; we're a force multiplier. We want to give every student the same high-quality preparation once reserved for those with expensive tutors.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mb-10 text-center">
          <div className="bg-gray-900 rounded-[28px] border-[2.5px] border-gray-700 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 relative z-10">Start your accelerated <br className="hidden md:block"/> learning journey today</h2>
            <div className="flex justify-center relative z-10">
              <LandingCTAButton
                eventName="about_cta_clicked"
                className="pink-glowing-button group relative rounded-[10px] flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[12px_28px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
              >
                <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                  <span className="blurred-border absolute inset-0 z-20" />
                </span>
                <span className="relative z-30">Get Started for Free</span>
              </LandingCTAButton>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
