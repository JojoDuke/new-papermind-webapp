import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { pageMetadata } from '@/lib/site';
import { Footer } from '@/components/marketing/Footer';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { BlogPostCover } from '@/components/marketing/BlogPostCover';
import {
  formatBlogDate,
  getBlogPostsByDate,
  type BlogPostMeta,
} from '@/lib/blog';

export const metadata: Metadata = pageMetadata('/blog', {
  title: 'Blog — Papermind',
  description:
    'Study tips, AI insights, and exam strategies from the Papermind team.',
});

function LatestPostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative bg-white rounded-[24px] border-[2.5px] border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 block w-full"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-[58%] p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-4 group-hover:text-[#FF5392] transition-colors leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-sans">
            {post.excerpt}
          </p>
          <div className="text-xs text-gray-400 font-sans mt-auto">
            <p className="text-gray-700 font-semibold">{post.author}</p>
            <p>
              {formatBlogDate(post.publishedAt)} · {post.readTime}
            </p>
          </div>
        </div>
        <BlogPostCover
          post={post}
          className="md:w-[42%] min-h-[200px] md:min-h-[240px]"
          fit="contain"
          inset
          priority
          sizes="(max-width: 768px) 100vw, 420px"
        />
      </div>
    </Link>
  );
}

function OlderPostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-[20px] border-[2.5px] border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <BlogPostCover
        post={post}
        className="h-[140px] md:h-[160px] w-full"
        fit="contain"
        inset
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="p-6">
        <h3 className="text-lg font-bold font-serif text-gray-900 mb-2 group-hover:text-[#FF5392] transition-colors leading-snug">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 font-sans line-clamp-2">
          {post.excerpt}
        </p>
        <p className="text-xs text-gray-400 font-sans">
          {post.author} · {formatBlogDate(post.publishedAt)} · {post.readTime}
        </p>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const posts = getBlogPostsByDate();
  const [latestPost, ...olderPosts] = posts;

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

        {latestPost ? (
          <LatestPostCard post={latestPost} />
        ) : (
          <div className="rounded-[24px] border-[2.5px] border-dashed border-gray-200 bg-white/60 px-8 py-14 text-center">
            <p className="text-lg font-serif font-bold text-gray-900 mb-2">No posts yet</p>
            <p className="text-sm text-gray-500 font-sans max-w-md mx-auto leading-relaxed">
              Add a new <code className="text-[#FF5392]">.mdx</code> file in{' '}
              <code className="text-[#FF5392]">content/blog/</code> to publish your first post.
              Copy <code className="text-[#FF5392]">_template.mdx</code> to get started.
            </p>
          </div>
        )}

        {olderPosts.length > 0 ? (
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            {olderPosts.map((post) => (
              <OlderPostCard key={post.slug} post={post} />
            ))}
          </section>
        ) : null}

        {/* ── Newsletter CTA ── */}
        <section className="mt-32">
          <div className="relative bg-gray-900 rounded-[24px] border-[2.5px] border-gray-700 overflow-hidden px-8 py-16 text-center">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5392] mb-4 relative z-10">
              Stay Sharp
            </p>
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
