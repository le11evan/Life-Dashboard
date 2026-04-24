"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark47 } from "@/components/ui/mark-47";
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Wallet,
  BookOpen,
  Target,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
  ShoppingCart,
  Apple,
} from "lucide-react";

type Accent = "pink" | "cyan" | "orange" | "lime" | "purple" | "yellow";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  accent: Accent;
}> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "pink" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, accent: "cyan" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, accent: "orange" },
  { href: "/diet", label: "Diet", icon: Apple, accent: "lime" },
  { href: "/finance", label: "Finance", icon: Wallet, accent: "purple" },
  { href: "/journal", label: "Journal", icon: BookOpen, accent: "yellow" },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart, accent: "lime" },
  { href: "/goals", label: "Goals", icon: Target, accent: "pink" },
  { href: "/learn", label: "Learn", icon: GraduationCap, accent: "cyan" },
  { href: "/creative", label: "Creative", icon: Lightbulb, accent: "purple" },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: (typeof navItems)[number] }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className="relative flex items-center gap-3 px-3 py-2.5 row-press"
        style={{
          borderRadius: 14,
          color: isActive ? "var(--fg)" : "var(--fg-dim)",
          background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
          border: "1px solid",
          borderColor: isActive ? "var(--line)" : "transparent",
          transition: "color .15s ease, background .15s ease",
        }}
      >
        <Icon
          className="w-5 h-5"
          style={{
            color: isActive ? `var(--${item.accent})` : "var(--fg-mute)",
            filter: isActive
              ? `drop-shadow(0 0 6px var(--${item.accent}))`
              : "none",
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen p-4"
      style={{
        background: "rgba(11,11,24,0.72)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderRight: "1px solid var(--line-soft)",
      }}
    >
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <Mark47 size={30} gradient />
        <div
          style={{
            fontFamily: "var(--ff-display)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontSize: 20,
          }}
        >
          <span style={{ color: "var(--fg)" }}>elevan</span>
          <span className="brand-gradient-text">.life</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <div
        className="pt-4 space-y-1"
        style={{ borderTop: "1px solid var(--line-soft)" }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 row-press"
          style={{ borderRadius: 14, color: "var(--fg-dim)" }}
        >
          <Settings className="w-5 h-5" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Settings</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            fetch("/api/logout", { method: "POST" }).then(() => {
              window.location.href = "/login";
            });
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 row-press"
          style={{
            borderRadius: 14,
            color: "var(--pink)",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <LogOut className="w-5 h-5" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Logout</span>
        </button>
      </div>

      <div
        className="mt-3 pt-3"
        style={{ borderTop: "1px solid var(--line-soft)" }}
      >
        <p
          className="t-mono"
          style={{
            fontSize: 9,
            color: "var(--fg-faint)",
            textAlign: "center",
            letterSpacing: "0.12em",
          }}
        >
          elevan.life v2.0
        </p>
      </div>
    </aside>
  );
}
