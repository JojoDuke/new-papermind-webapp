import { BlogPostArticleImage } from '@/components/marketing/BlogPostArticleImage';

type BlogImageProps = {
  src: string;
  alt: string;
};

/** Place anywhere in MDX: <BlogImage src="/blog/photo.jpg" alt="Description" /> */
export function BlogImage({ src, alt }: BlogImageProps) {
  return <BlogPostArticleImage src={src} alt={alt} />;
}
