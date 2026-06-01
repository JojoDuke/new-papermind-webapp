import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function isPublishedPostFile(fileName: string): boolean {
  return fileName.endsWith('.mdx') && !fileName.startsWith('_');
}

function getMdxFileNames(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs.readdirSync(BLOG_DIR).filter(isPublishedPostFile);
}

function slugFromFileName(fileName: string): string {
  return fileName.replace(/\.mdx$/, '');
}

function parsePostMeta(slug: string, data: Record<string, unknown>): BlogPostMeta {
  const title = typeof data.title === 'string' ? data.title : slug;
  const excerpt = typeof data.excerpt === 'string' ? data.excerpt : '';
  const author = typeof data.author === 'string' ? data.author : 'Papermind Team';
  const publishedAt =
    typeof data.publishedAt === 'string' ? data.publishedAt : new Date().toISOString().slice(0, 10);
  const readTime = typeof data.readTime === 'string' ? data.readTime : '5 min read';

  return { slug, title, excerpt, author, publishedAt, readTime };
}

export function getBlogPostSlugs(): string[] {
  return getMdxFileNames().map(slugFromFileName);
}

export function getBlogPostsByDate(): BlogPostMeta[] {
  return getMdxFileNames()
    .map((fileName) => {
      const slug = slugFromFileName(fileName);
      const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf8');
      const { data } = matter(raw);
      return parsePostMeta(slug, data);
    })
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    ...parsePostMeta(slug, data),
    content,
  };
}

export function formatBlogDate(publishedAt: string): string {
  return new Date(`${publishedAt}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
