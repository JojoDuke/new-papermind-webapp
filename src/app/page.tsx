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

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-50 group">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 border border-pink-200 group-hover:bg-pink-200 transition-colors">
              <svg className="w-7 h-7 text-[#FF5392]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">
              PDF Upload
            </h3>
            <p className="text-gray-600 leading-relaxed font-sans">
              Simply upload your study materials and let AI extract the key concepts automatically.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-50 group">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 border border-purple-200 group-hover:bg-purple-200 transition-colors">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">
              AI Quizzes
            </h3>
            <p className="text-gray-600 leading-relaxed font-sans">
              Get personalized quizzes tailored to your learning style and difficulty preferences.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-50 group">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 border border-indigo-200 group-hover:bg-indigo-200 transition-colors">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">
              Track Progress
            </h3>
            <p className="text-gray-600 leading-relaxed font-sans">
              Monitor your learning progress and identify areas that need more attention.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
