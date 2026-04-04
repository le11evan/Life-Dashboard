"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "pink" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "cyan" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, color: "orange" },
  { href: "/diet", label: "Diet", icon: Apple, color: "green" },
  { href: "/finance", label: "Finance", icon: Wallet, color: "purple" },
  { href: "/journal", label: "Journal", icon: BookOpen, color: "yellow" },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart, color: "teal" },
  { href: "/goals", label: "Goals", icon: Target, color: "pink" },
  { href: "/learn", label: "Learn", icon: GraduationCap, color: "cyan" },
  { href: "/creative", label: "Creative", icon: Lightbulb, color: "purple" },
];

const colorClasses: Record<string, { active: string; icon: string }> = {
  pink: { active: "bg-[#FF2D78]/15 border-[#FF2D78]/30", icon: "text-[#FF2D78]" },
  cyan: { active: "bg-[#00E5FF]/15 border-[#00E5FF]/30", icon: "text-[#00E5FF]" },
  orange: { active: "bg-[#FF6B35]/15 border-[#FF6B35]/30", icon: "text-[#FF6B35]" },
  green: { active: "bg-[#39FF14]/15 border-[#39FF14]/30", icon: "text-[#39FF14]" },
  purple: { active: "bg-[#9D4EDD]/15 border-[#9D4EDD]/30", icon: "text-[#9D4EDD]" },
  yellow: { active: "bg-[#FFD600]/15 border-[#FFD600]/30", icon: "text-[#FFD600]" },
  teal: { active: "bg-teal-500/15 border-teal-500/30", icon: "text-teal-400" },
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
            : "text-[#8888a0] hover:bg-white/[0.03] hover:text-white border-transparent"
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
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0e0e1a]/80 backdrop-blur-xl border-r border-white/[0.06] p-4">
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <Mark47 size={36} gradient />
        <div>
          <span className="text-lg font-semibold text-white">elevan</span>
          <span className="text-lg font-semibold text-[#FF2D78]">.life</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-white/[0.06] pt-4 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888a0] hover:bg-white/[0.03] hover:text-white transition-colors"
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888a0] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        <p className="text-[10px] text-[#8888a0]/40 text-center">elevan.life v2.0</p>
      </div>
    </aside>
  );
}
