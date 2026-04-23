"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordGateProps {
  onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect password");
        setShake(true);
        setPassword("");
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div
        className="relative w-full max-w-xs"
        style={
          shake
            ? { animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both" }
            : {}
        }
      >
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h1 className="text-base font-semibold text-foreground">Private</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your password to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                id="journal-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                autoFocus
                autoComplete="current-password"
                className={`w-full h-9 pl-3 pr-9 rounded-md border text-sm bg-background
                  placeholder:text-muted-foreground/50 outline-none transition-all
                  focus:ring-2 focus:ring-ring/50 focus:border-ring
                  ${error ? "border-destructive ring-2 ring-destructive/20" : "border-border"}
                  disabled:opacity-50`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !password.trim()}
              size="sm"
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
