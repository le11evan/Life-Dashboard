"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Sparkles, Zap, Target, Dumbbell, Wallet } from "lucide-react";
import { Mark47 } from "@/components/ui/mark-47";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const floatingIcons = [
  { Icon: Sparkles, color: "text-[#FFD600]", delay: 0 },
  { Icon: Zap, color: "text-[#00E5FF]", delay: 0.2 },
  { Icon: Target, color: "text-[#FF2D78]", delay: 0.4 },
  { Icon: Dumbbell, color: "text-[#FF6B35]", delay: 0.6 },
  { Icon: Wallet, color: "text-[#39FF14]", delay: 0.8 },
];

export function LoginForm() {
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
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] p-4 overflow-hidden relative">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#FF2D78]/15 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#00E5FF]/15 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-to-bl from-[#9D4EDD]/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map(({ Icon, color, delay }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-20, -200],
              x: [0, Math.sin(i * 2) * 50],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: delay + i * 0.5,
              ease: "easeOut",
            }}
            className={`absolute ${color}`}
            style={{
              left: `${15 + i * 18}%`,
              bottom: "10%",
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/[0.04] rounded-3xl shadow-2xl p-8 border border-white/[0.08] relative overflow-hidden glow-breathe">
          {/* Shine effect */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF2D78]/10 to-transparent skew-x-12"
          />

          <div className="text-center mb-8 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative inline-block"
            >
              <Mark47 size={64} gradient className="mx-auto mb-4" />
              {/* Glow ring */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-[#FF2D78] to-[#00E5FF] rounded-2xl blur-xl opacity-30"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold"
            >
              <span className="text-white">elevan</span>
              <span className="text-[#FF2D78]">.life</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#8888a0] mt-2"
            >
              Your personal command center
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#8888a0]/60 rounded-xl pl-12 text-lg focus:border-[#FF2D78]/50 focus:ring-[#FF2D78]/20 transition-all"
                  autoFocus
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8888a0]" />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-sm text-red-400 text-center">{error}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#FF2D78] via-[#9D4EDD] to-[#00E5FF] hover:from-[#FF1565] hover:via-[#8B3DC7] hover:to-[#00CCE5] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#FF2D78]/25 transition-all duration-300 hover:shadow-[#FF2D78]/40 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading || !password}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  "Enter Dashboard"
                )}
              </Button>
            </motion.div>
          </form>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-white/[0.06]"
          >
            <div className="flex justify-center gap-2">
              {["Fitness", "Finance", "Goals", "Journal"].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="px-2 py-1 rounded-full bg-white/[0.04] text-xs text-[#8888a0] border border-white/[0.06]"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
