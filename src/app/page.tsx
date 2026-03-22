import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 text-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-serif">
            The Fastest Way to Pass Your Next Exam
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            From university finals to professional certifications — AI-powered flashcards, quizzes, and mock exams, ready in seconds.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-20">
            <Link
              href="/auth"
              className="group relative bg-[#FF5392] text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,83,146,0.3)] hover:-translate-y-1 active:scale-95 inline-block text-xl"
            >
              <span className="blurred-border absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10">Start Studying — It's free</span>
            </Link>
          </div>
        </div>


      </main>
    </div>
  );
}
