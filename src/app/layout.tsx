import type { Metadata } from "next";
import { Plus_Jakarta_Sans, PT_Serif } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { AdminNewUserNotify } from "@/components/app/AdminNewUserNotify";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { PostHogPageView } from "@/components/marketing/PostHogPageView";
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
  metadataBase: new URL(SITE_URL),
  title: "Papermind - AI-Powered Study Tool",
  description: "Transform your study materials into interactive quizzes with the power of AI. Upload PDFs, generate personalized quizzes, and master your subjects faster.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply dark class before paint to prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t==null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
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
