"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User as UserIcon } from "lucide-react";
import { Mark47 } from "@/components/ui/mark-47";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!USERNAME_RE.test(username)) {
      setError("Username must be 3–20 chars, letters/numbers/underscore only");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: "Signup failed" }));
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: "var(--ink-000)" }}
    >
      <div className="ambient-bg" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="tile tile--elev grain" style={{ padding: 32 }}>
          <div className="text-center mb-7 relative">
            <Mark47 size={56} gradient className="mx-auto mb-4" />
            <h1
              className="t-display"
              style={{ fontSize: 30, letterSpacing: "-0.03em" }}
            >
              <span style={{ color: "var(--fg)" }}>create your</span>{" "}
              <span className="brand-gradient-text">space</span>
            </h1>
            <p
              className="t-mono mt-2"
              style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.08em" }}
            >
              tasks, fitness, journal, all yours
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="h-12 pl-11 rounded-xl text-[15px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--line)",
                  color: "var(--fg)",
                }}
              />
              <UserIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--fg-mute)" }}
              />
            </div>

            <div className="relative">
              <Input
                type="password"
                placeholder="password (8+ chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-12 pl-11 rounded-xl text-[15px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--line)",
                  color: "var(--fg)",
                }}
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--fg-mute)" }}
              />
            </div>

            <div className="relative">
              <Input
                type="password"
                placeholder="confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-12 pl-11 rounded-xl text-[15px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--line)",
                  color: "var(--fg)",
                }}
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--fg-mute)" }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(255,45,120,0.08)",
                  border: "1px solid rgba(255,45,120,0.25)",
                }}
              >
                <p
                  className="t-mono text-center"
                  style={{ fontSize: 11, color: "var(--pink)", letterSpacing: "0.05em" }}
                >
                  {error}
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-[14px] font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
                color: "#fff",
                boxShadow: "0 14px 40px -14px rgba(255,45,120,0.55)",
              }}
              disabled={loading || !username || !password || !confirm}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 rounded-full"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                  }}
                />
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <div
            className="mt-6 pt-5 text-center"
            style={{ borderTop: "1px solid var(--line-soft)" }}
          >
            <p className="t-mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
              already have one?{" "}
              <Link
                href="/login"
                className="brand-gradient-text"
                style={{ fontWeight: 700 }}
              >
                log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
