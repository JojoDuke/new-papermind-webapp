export type MarketingUseCase = {
  slug: string;
  title: string;
  description: string;
};

export const marketingUseCases: MarketingUseCase[] = [
  {
    slug: 'nclex-rn',
    title: 'NCLEX-RN',
    description: 'Pass your nursing boards',
  },
];

export function useCaseHref(slug: string) {
  return `/use-cases/${slug}`;
}
