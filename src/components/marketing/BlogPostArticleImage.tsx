import Image from 'next/image';

type BlogPostArticleImageProps = {
  src: string;
  alt: string;
};

export function BlogPostArticleImage({ src, alt }: BlogPostArticleImageProps) {
  return (
    <div className="relative my-8 w-full overflow-hidden rounded-2xl border-[2.5px] border-gray-200 aspect-[16/10] bg-pink-50/30">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 760px"
        priority
      />
    </div>
  );
}
