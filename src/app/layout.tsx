import type { Metadata } from "next";
import { Plus_Jakarta_Sans, PT_Serif } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { AdminNewUserNotify } from "@/components/AdminNewUserNotify";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { Suspense } from "react";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Papermind - AI-Powered Study Tool",
  description: "Transform your study materials into interactive quizzes with the power of AI. Upload PDFs, generate personalized quizzes, and master your subjects faster.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.variable} ${ptSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConvexAuthNextjsServerProvider>
          <PostHogProvider>
            <ConvexClientProvider>
              <AdminNewUserNotify />
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <div className="relative min-h-screen">
                {children}
              </div>
            </ConvexClientProvider>
          </PostHogProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
