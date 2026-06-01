import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mt-12 mb-4 leading-tight first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mt-10 mb-3 leading-snug"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="text-xl font-bold font-serif text-gray-900 mt-8 mb-2" {...props} />
  ),
  p: (props) => <p className="text-gray-600 leading-relaxed mb-5 font-sans" {...props} />,
  ul: (props) => (
    <ul className="list-disc pl-6 mb-5 space-y-2 text-gray-600 font-sans" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-5 space-y-2 text-gray-600 font-sans" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-[#FF5392] pl-4 my-6 text-gray-700 italic font-sans"
      {...props}
    />
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http');

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF5392] font-medium underline underline-offset-2 hover:opacity-80"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href ?? '#'}
        className="text-[#FF5392] font-medium underline underline-offset-2 hover:opacity-80"
        {...props}
      >
        {children}
      </Link>
    );
  },
  strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
  hr: (props) => <hr className="my-10 border-gray-200" {...props} />,
  code: (props) => (
    <code
      className="rounded bg-pink-50 px-1.5 py-0.5 text-sm text-[#FF5392] font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800"
      {...props}
    />
  ),
};
