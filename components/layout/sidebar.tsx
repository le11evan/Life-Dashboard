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
  ShoppingCart,
  Apple,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "violet" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "blue" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, color: "red" },
  { href: "/diet", label: "Diet", icon: Apple, color: "lime" },
  { href: "/finance", label: "Finance", icon: Wallet, color: "emerald" },
  { href: "/journal", label: "Journal", icon: BookOpen, color: "amber" },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart, color: "green" },
  { href: "/goals", label: "Goals", icon: Target, color: "purple" },
  { href: "/learn", label: "Learn", icon: GraduationCap, color: "indigo" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "pink" },
];

const colorClasses: Record<string, { active: string; icon: string }> = {
  violet: { active: "bg-violet-500/20 border-violet-500/30", icon: "text-violet-400" },
  blue: { active: "bg-blue-500/20 border-blue-500/30", icon: "text-blue-400" },
  green: { active: "bg-green-500/20 border-green-500/30", icon: "text-green-400" },
  red: { active: "bg-red-500/20 border-red-500/30", icon: "text-red-400" },
  lime: { active: "bg-lime-500/20 border-lime-500/30", icon: "text-lime-400" },
  emerald: { active: "bg-emerald-500/20 border-emerald-500/30", icon: "text-emerald-400" },
  amber: { active: "bg-amber-500/20 border-amber-500/30", icon: "text-amber-400" },
  purple: { active: "bg-purple-500/20 border-purple-500/30", icon: "text-purple-400" },
  indigo: { active: "bg-indigo-500/20 border-indigo-500/30", icon: "text-indigo-400" },
  pink: { active: "bg-pink-500/20 border-pink-500/30", icon: "text-pink-400" },
};

export function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;
    const colors = colorClasses[item.color];

    return (
      <Link
        href={item.href}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
          isActive
            ? `${colors.active} text-white`
            : "text-slate-400 hover:bg-slate-800/50 hover:text-white border-transparent"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? colors.icon : ""}`} />
        <span className="font-medium">{item.label}</span>
        {isActive && (
          <motion.div
            layoutId="sidebarActiveIndicator"
            className={`absolute inset-0 ${colors.active} rounded-xl -z-10 border`}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/5 p-4">
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <span className="text-lg text-white font-bold">L</span>
        </div>
        <span className="text-lg font-semibold text-white">Life Dashboard</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-white/5 pt-4 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
