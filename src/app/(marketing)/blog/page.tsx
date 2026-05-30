import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';

export const metadata = {
  title: 'Blog — Papermind',
  description:
    'Study tips, AI insights, and exam strategies from the Papermind team.',
};

const FEATURED_POST = {
  slug: 'how-to-study-smarter-not-harder',
  category: 'Study Science',
  categoryColor: 'bg-pink-50 text-[#FF5392]',
  title: 'How to Study Smarter, Not Harder: The Science Behind Active Recall',
  excerpt:
    "Passive re-reading gives you a false sense of confidence. Here's why active recall — the core of Papermind's flashcard engine — is the only revision method proven to stick.",
  author: { name: 'Papermind Team', initials: 'PM', color: 'bg-pink-100 text-pink-600' },
  date: 'May 8, 2026',
  readTime: '6 min read',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-10 md:py-16">
        
        {/* ── Hero ── */}
        <section className="pt-10 pb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-4">
            Insights & Strategy
          </p>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 tracking-tight leading-[1.05]">
            The <span className="text-[#FF5392]">Papermind</span> Blog
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto font-sans leading-relaxed">
            Science-backed study tips and exam strategies to help you pass faster.
          </p>
        </section>

        {/* ── Featured Post ── */}
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/blog/${FEATURED_POST.slug}`}
            className="group relative bg-white rounded-[24px] border-[2.5px] border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 block"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 ${FEATURED_POST.categoryColor}`}>
                  Featured • {FEATURED_POST.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-4 group-hover:text-[#FF5392] transition-colors leading-tight">
                  {FEATURED_POST.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-sans">
                  {FEATURED_POST.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${FEATURED_POST.author.color}`}>
                    {FEATURED_POST.author.initials}
                  </div>
                  <div className="text-xs text-gray-400 font-sans">
                    <p className="text-gray-700 font-semibold">{FEATURED_POST.author.name}</p>
                    <p>{FEATURED_POST.date} · {FEATURED_POST.readTime}</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 relative min-h-[300px] bg-pink-50/30 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-[#FF539220] to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 rounded-3xl bg-white border-[2.5px] border-gray-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-10 h-10 text-[#FF5392]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                   </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Newsletter CTA ── */}
        <section className="mt-32">
          <div className="relative bg-gray-900 rounded-[24px] border-[2.5px] border-gray-700 overflow-hidden px-8 py-16 text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-4 relative z-10">Stay Sharp</p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4 relative z-10">
              Study tips delivered to your inbox
            </h2>
            <p className="text-base text-gray-400 font-sans mb-10 max-w-lg mx-auto relative z-10">
              Weekly science-backed strategies to help you study smarter and pass your next exam.
            </p>
            
            <div className="flex justify-center relative z-10">
              <NewsletterForm />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}


