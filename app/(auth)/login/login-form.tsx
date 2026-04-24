"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User as UserIcon } from "lucide-react";
import { Mark47 } from "@/components/ui/mark-47";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError("Invalid credentials");
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
        <div
          className="tile tile--elev grain"
          style={{ padding: 32 }}
        >
          <div className="text-center mb-7 relative">
            <Mark47 size={56} gradient className="mx-auto mb-4" />
            <h1
              className="t-display"
              style={{ fontSize: 32, letterSpacing: "-0.03em" }}
            >
              <span style={{ color: "var(--fg)" }}>elevan</span>
              <span className="brand-gradient-text">.life</span>
            </h1>
            <p
              className="t-mono mt-2"
              style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.08em" }}
            >
              your personal command center
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
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
              disabled={loading || !username || !password}
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
                "Log in"
              )}
            </Button>
          </form>

          <div
            className="mt-6 pt-5 text-center"
            style={{ borderTop: "1px solid var(--line-soft)" }}
          >
            <p className="t-mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
              no account?{" "}
              <Link
                href="/signup"
                className="brand-gradient-text"
                style={{ fontWeight: 700 }}
              >
                sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
