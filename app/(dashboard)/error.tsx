"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[80dvh] flex items-center justify-center p-6">
      <div className="tile tile--elev edge-pink p-6 max-w-sm w-full text-center">
        <div className="t-kicker mb-2">something broke</div>
        <h1
          className="t-display"
          style={{ fontSize: 28, color: "var(--fg)", letterSpacing: "-0.02em" }}
        >
          we hit a snag
        </h1>
        <p
          className="t-mono mt-3"
          style={{ fontSize: 12, color: "var(--fg-mute)" }}
        >
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p
            className="t-mono mt-2"
            style={{ fontSize: 10, color: "var(--fg-faint)" }}
          >
            digest: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-2 mt-5">
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-xl font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--pink), var(--purple))",
              color: "#fff",
              border: "none",
            }}
          >
            Try again
          </button>
          <Link
            href="/login"
            className="t-mono"
            style={{
              fontSize: 11,
              color: "var(--fg-mute)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Sign in again
          </Link>
        </div>
      </div>
    </div>
  );
}
