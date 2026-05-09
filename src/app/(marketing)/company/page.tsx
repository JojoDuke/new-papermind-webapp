import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company - Papermind',
  description: 'Meet the team behind Papermind and follow our journey in building the world\'s most efficient AI study tool.',
};

const stats = [
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'London, UK' },
  { label: 'Students Helped', value: '100k+' },
  { label: 'Study Sets Created', value: '2M+' },
];

const team = [
  {
    name: 'Alex Rivers',
    role: 'Co-founder & CEO',
    bio: 'Former PhD in Learning Analytics. Obsessed with how AI can bridge the gap between information and understanding.',
    avatar: 'AR',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Chen Wei',
    role: 'Co-founder & CTO',
    bio: 'Ex-DeepMind Engineer. Specialized in building secure, high-performance RAG systems for complex document parsing.',
    avatar: 'CW',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Sophia Thorne',
    role: 'Head of Engineering',
    bio: 'Passionate about building intuitive, blazing-fast web experiences for students worldwide.',
    avatar: 'ST',
    color: 'bg-purple-100 text-purple-600',
  },
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 md:py-24">
        {/* ── Hero ── */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-3">Company</p>
              <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 tracking-tight leading-tight">
                Designed for the next <span className="text-[#FF5392]">generation</span> of experts
              </h1>
              <p className="text-lg text-gray-600 font-sans leading-relaxed mb-8">
                Papermind is a team of educators, engineers, and designers based in London. We are building the tools we wish we had when we were studying for our own professional exams.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold font-serif text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-400 font-sans">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-tr from-pink-100 to-purple-100 rounded-[32px] blur-2xl opacity-30" />
              <div className="relative bg-white border-[2.5px] border-gray-200 rounded-[28px] p-8 aspect-square flex flex-col justify-center items-center shadow-sm">
                 <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                    <div className="bg-pink-50/50 rounded-2xl border-2 border-pink-100/50 animate-pulse" />
                    <div className="bg-purple-50/50 rounded-2xl border-2 border-purple-100/50" />
                    <div className="bg-blue-50/50 rounded-2xl border-2 border-blue-100/50" />
                    <div className="bg-emerald-50/50 rounded-2xl border-2 border-emerald-100/50 animate-pulse delay-75" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Journey/Timeline ── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-500 font-sans">From a small script to a global study platform.</p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-4 bottom-0 w-px bg-gray-100 hidden md:block" />
            
            <div className="space-y-16">
              {[
                { year: '2024', event: 'Founded in London', pos: 'right', desc: 'Started with the goal of making USMLE prep more efficient.' },
                { year: '2024', event: 'Seed Funding', pos: 'left', desc: 'Raised $2.4M from top-tier ed-tech investors.' },
                { year: '2025', event: 'Global Expansion', pos: 'right', desc: 'Reached 100k active students across 5 continents.' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${item.pos === 'left' ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 flex flex-col justify-center px-8">
                     <div className={`p-8 bg-white border-[2.5px] border-gray-200 rounded-[24px] shadow-sm hover:border-[#FF5392]/30 transition-all ${item.pos === 'left' ? 'text-right' : 'text-left'}`}>
                       <p className="text-xs font-black text-[#FF5392] mb-1">{item.year}</p>
                       <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{item.event}</h3>
                       <p className="text-gray-500 font-sans text-sm">{item.desc}</p>
                     </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-[#FF5392] z-10 hidden md:block" />
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-gray-500 font-sans">The people behind the pixels.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((person) => (
              <div key={person.name} className="bg-white rounded-[24px] border-[2.5px] border-gray-200 p-8 flex flex-col gap-6 group hover:border-[#FF5392]/40 transition-all">
                <div className={`w-16 h-16 rounded-2xl ${person.color} flex items-center justify-center text-xl font-bold`}>
                  {person.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900 mb-1">{person.name}</h3>
                  <p className="text-sm font-semibold text-[#FF5392] mb-4">{person.role}</p>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed text-left">
                    {person.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Careers/Hiring ── */}
        <section className="mb-10">
          <div className="bg-linear-to-r from-[#FF5392] to-[#FF7DB4] rounded-[28px] p-12 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="grid grid-cols-8 gap-4 rotate-12 -translate-y-20">
                    {[...Array(32)].map((_, i) => (
                        <div key={i} className="w-12 h-12 bg-white rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="max-w-xl relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">Join our mission</h2>
              <p className="text-white/80 font-sans text-lg">
                We're always looking for ambitious engineers and educators who want to reshape the future of learning. Check out our open roles.
              </p>
            </div>
            <Link 
              href="mailto:careers@papermind.com" 
              className="bg-white text-[#FF5392] font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-all active:scale-95 whitespace-nowrap relative z-10"
            >
              See Openings
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
