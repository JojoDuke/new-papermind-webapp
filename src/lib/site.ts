import type { Metadata } from 'next';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.usepapermind.app'
).replace(/\/$/, '');

export function pageMetadata(
  path: string,
  metadata: Omit<Metadata, 'alternates'> & { alternates?: Metadata['alternates'] },
): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
  };
}

export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
