"use client";

import { useEffect, useState } from "react";

export function InstallBanner() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("install-banner-dismissed");
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!dismissed && !standalone) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem("install-banner-dismissed", "1");
    } catch {}
    setOpen(false);
  };

  return (
    <div className="install-banner" onClick={() => setExpanded((v) => !v)}>
      <div className="install-banner__row">
        <div className="install-banner__icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3v13M12 3l-4 4M12 3l4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="install-banner__text">
          <div className="t-kicker">install</div>
          <div className="install-banner__title">Add to Home Screen</div>
        </div>
        <button
          type="button"
          className="install-banner__x"
          onClick={dismiss}
          aria-label="dismiss"
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="install-banner__steps">
          <div className="install-step">
            <span className="install-step__n">1</span>
            <span className="install-step__txt">
              <span style={{ color: "var(--fg-dim)" }}>Tap the </span>
              <svg
                width="13"
                height="16"
                viewBox="0 0 24 28"
                fill="none"
                style={{ verticalAlign: "middle", margin: "0 4px" }}
              >
                <path
                  d="M12 3v15M12 3l-4 4M12 3l4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 13v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Share icon in Safari
            </span>
          </div>
          <div className="install-step">
            <span className="install-step__n">2</span>
            <span className="install-step__txt">
              <span style={{ color: "var(--fg-dim)" }}>Scroll and tap </span>
              <span style={{ color: "var(--fg)", fontWeight: 600 }}>
                &ldquo;Add to Home Screen&rdquo;
              </span>
            </span>
          </div>
          <div className="install-step">
            <span className="install-step__n">3</span>
            <span className="install-step__txt">
              <span style={{ color: "var(--fg-dim)" }}>Tap </span>
              <span style={{ color: "var(--fg)", fontWeight: 600 }}>Add</span>
              <span style={{ color: "var(--fg-dim)" }}>
                {" "}
                — opens full-screen like a native app.
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
