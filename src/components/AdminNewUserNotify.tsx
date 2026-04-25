"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

/**
 * One shot after the session is ready: tells Convex to email the admin for brand-new
 * accounts. Shows as `newUserAdminEmail:notifyAdminIfNew` in Convex function logs.
 */
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
        const result = await notify({});
        console.log("[newUserSignUp] client notify result", result);
      } catch (e) {
        console.error("[newUserSignUp] AdminNewUserNotify failed", e);
      }
    })();
  }, [isLoading, isAuthenticated, notify]);

  return null;
}
