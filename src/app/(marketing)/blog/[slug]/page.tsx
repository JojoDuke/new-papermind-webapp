import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { mdxComponents } from '@/components/marketing/mdx-components';
import {
  formatBlogDate,
  getBlogPostBySlug,
  getBlogPostSlugs,
} from '@/lib/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Post not found — Papermind' };
  }

  return {
    title: `${post.title} — Papermind Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50/50 via-white to-purple-50/30 relative overflow-x-hidden">
      <Navbar />

      <main className="max-w-[760px] mx-auto px-4 md:px-0 py-10 md:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#FF5392] transition-colors mb-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to blog
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-5 tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-500 font-sans text-sm">
            {post.author} · {formatBlogDate(post.publishedAt)} · {post.readTime}
          </p>
        </header>

        <article>
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
