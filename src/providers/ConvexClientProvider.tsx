"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            fontFamily: "var(--font-jakarta-sans)",
            fontSize: "14px",
          },
          success: {
            style: {
              background: "#fdf2f8",
              color: "#9d174d",
              border: "1px solid #fbcfe8",
            },
            iconTheme: {
              primary: "#ec4899",
              secondary: "#fdf2f8",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
          },
        }}
      />
    </ConvexAuthProvider>
  );
}