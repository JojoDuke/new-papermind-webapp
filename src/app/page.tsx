import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 text-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-serif tracking-tight">
            The Fastest Way to Pass Your Next Exam
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            From university finals to professional certifications, create AI-powered flashcards, quizzes, and mock exams, ready in seconds.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <Link 
              href="/auth" 
              className="pink-glowing-button group relative rounded-[10px] flex items-center gap-[6px] w-fit text-white font-medium text-[16px] tracking-[-0.13px] p-[10px_20px] shadow-lg transition-all active:scale-95 outline-none focus:outline-none"
            >
              {/* Animated Glossy Border */}
              <span className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
                <span className="blurred-border absolute inset-0 z-20"></span>
              </span>
              
              {/* Laptop Icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-laptop pointer-events-none z-30" 
                aria-hidden="true"
              >
                <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"></path>
                <path d="M20.054 15.987H3.946"></path>
              </svg>

              <span className="relative z-30">Start Studying — It's free</span>
            </Link>
          </div>

          {/* Webapp Preview Box */}
          <div className="mt-8 relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 to-purple-200 rounded-[24px] blur-xl opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white border border-white/40 shadow-2xl rounded-[20px] overflow-hidden backdrop-blur-sm aspect-[16/9] flex items-center justify-center">
              <img 
                src="/assets/webapp_preview_screenshot.png"
                alt="Papermind Webapp Preview"
                className="w-full h-full object-cover rounded-[18px]"
              />
              {/* Subtle Overlay Glow */}
              <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>


      </main>
      <Footer />
    </div>
  );
}
