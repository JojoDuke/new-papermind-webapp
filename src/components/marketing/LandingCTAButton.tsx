"use client";

import Link from "next/link";
import posthog from "posthog-js";

interface LandingCTAButtonProps {
  eventName: string;
  className: string;
  children: React.ReactNode;
}

export function LandingCTAButton({ eventName, className, children }: LandingCTAButtonProps) {
  return (
    <Link
      href="/sign-up"
      className={className}
      onClick={() => posthog.capture(eventName)}
    >
      {children}
    </Link>
  );
}
