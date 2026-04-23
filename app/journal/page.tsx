"use client";

import { useEffect, useState } from "react";
import { PasswordGate } from "@/components/journal/password-gate";
import { JournalView } from "@/components/journal/journal-view";

type AuthState = "checking" | "unauthenticated" | "authenticated";

export default function JournalPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    // Check if existing session cookie is still valid
    fetch("/api/auth/journal/check")
      .then((res) => {
        if (res.ok) {
          setAuthState("authenticated");
        } else {
          setAuthState("unauthenticated");
        }
      })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  if (authState === "checking") {
    // Brief loading state while verifying session
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <PasswordGate onSuccess={() => setAuthState("authenticated")} />;
  }

  return <JournalView />;
}
