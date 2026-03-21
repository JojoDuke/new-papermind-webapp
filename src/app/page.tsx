import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 text-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-6">
            <span className="text-lg">🦊</span> Meet Paige, your AI study companion
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-serif">
            Paper<span className="bg-gradient-to-r from-[#FF5392] to-purple-600 bg-clip-text text-transparent">mind</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            Transform your study materials into interactive quizzes with the power of AI. 
            Upload PDFs, generate personalized quizzes, and master your subjects faster.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 font-sans">
            <Link href="/auth" className="bg-[#FF5392] hover:bg-[#FF5392]/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 inline-block text-center text-lg">
              Get Started for Free
            </Link>
            <button className="border-2 border-gray-200 hover:border-[#FF5392]/30 hover:bg-[#FF5392]/5 text-gray-700 px-8 py-4 rounded-xl font-bold transition-all text-lg">
              See how it works
            </button>
          </div>
        </div>


      </main>
    </div>
  );
}
