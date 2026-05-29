"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";

/** One shot after the session is ready: triggers admin Telegram alert for very new accounts. */
export function AdminNewUserNotify() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notify = useMutation(api.newUserAdminEmail.notifyAdminIfNew);
  const ran = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || ran.current) return;
    // Set synchronously so React 18 strict-mode double effect does not run two mutations.
    ran.current = true;
    void (async () => {
      try {
        await notify({});
      } catch {
        // console.error("[newUserSignUp] AdminNewUserNotify failed", e);
      }
    })();
  }, [isLoading, isAuthenticated, notify]);

  return null;
}
