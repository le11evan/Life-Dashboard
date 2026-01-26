"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
} from "lucide-react";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

const secondaryNavItems = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/creative", label: "Creative", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
        {isActive && (
          <motion.div
            layoutId="sidebarActiveIndicator"
            className="absolute inset-0 bg-primary rounded-xl -z-10"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r p-4">
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-lg text-primary-foreground font-bold">L</span>
        </div>
        <span className="text-lg font-semibold">Life Dashboard</span>
      </div>

      <nav className="flex-1 space-y-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}

        <div className="pt-4 mt-4 border-t">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            More
          </p>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      <div className="border-t pt-4 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={() => {
            fetch("/api/logout", { method: "POST" }).then(() => {
              window.location.href = "/login";
            });
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
