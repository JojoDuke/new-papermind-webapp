'use client';

import { StudyGuideSectionBody } from '@/components/app/StudyGuideSectionBody';

type StudyGuideContentProps = {
  content: string;
};

/** @deprecated Prefer StudyGuideSectionBody or StudyGuideDetailView */
export function StudyGuideContent({ content }: StudyGuideContentProps) {
  return <StudyGuideSectionBody content={content} />;
}
