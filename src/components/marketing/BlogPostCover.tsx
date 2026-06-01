import Image from 'next/image';
import type { BlogPostMeta } from '@/lib/blog';

type BlogPostCoverProps = {
  post: Pick<BlogPostMeta, 'title' | 'image' | 'imageAlt'>;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** cover = fill & crop; contain = show full image inside the frame */
  fit?: 'cover' | 'contain';
  /** inset padding so the image sits smaller inside the card */
  inset?: boolean;
};

export function BlogPostCover({
  post,
  className = '',
  imageClassName = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 600px',
  fit = 'cover',
  inset = false,
}: BlogPostCoverProps) {
  const objectClass = fit === 'contain' ? 'object-contain' : 'object-cover';
  const hoverClass = fit === 'contain' ? '' : 'group-hover:scale-105';

  return (
    <div
      className={`relative overflow-hidden bg-pink-50/30 ${inset ? 'flex items-center justify-center p-5 md:p-6' : ''} ${className}`}
    >
      {post.image ? (
        <div className={`relative ${inset ? 'h-full w-full max-h-full' : 'absolute inset-0'}`}>
          <Image
            src={post.image}
            alt={post.imageAlt ?? post.title}
            fill
            className={`${objectClass} transition-transform duration-500 ${hoverClass} ${imageClassName}`}
            priority={priority}
            sizes={sizes}
          />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-linear-to-tr from-[#FF539220] to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border-[2.5px] border-gray-200 flex items-center justify-center shadow-lg">
              <svg
                className="w-9 h-9 text-[#FF5392]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
