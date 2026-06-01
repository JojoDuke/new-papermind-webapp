import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/marketing/mdx-components';
import { BlogImage } from '@/components/marketing/BlogImage';
import type { BlogPost } from '@/lib/blog';

type BlogPostArticleProps = {
  post: BlogPost;
};

export function BlogPostArticle({ post }: BlogPostArticleProps) {
  return (
    <article>
      <MDXRemote
        source={post.content}
        components={{
          ...mdxComponents,
          BlogImage,
        }}
      />
    </article>
  );
}
