"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  LogOut,
  Download,
  Database,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Mark47 } from "@/components/ui/mark-47";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportAllData, getBackupStats } from "@/lib/actions/backup";

type BackupStats = {
  tasks: number;
  templates: number;
  exercises: number;
  dietLogs: number;
  supplements: number;
  weightLogs: number;
  holdings: number;
  watchlist: number;
  journal: number;
  groceries: number;
  goals: number;
  ideas: number;
  total: number;
};

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    getBackupStats().then(setStats);
  }, []);

  async function handleExport() {
    startTransition(async () => {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `elevan-life-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Settings className="w-6 h-6 text-[color:var(--pink)]" />
          Settings
        </h1>
        <p className="text-[color:var(--fg-mute)]">App preferences and data management</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Data Backup Card */}
        <Card className="rounded-2xl bg-[var(--ink-100)] border-[color:var(--line)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Database className="w-5 h-5 text-[color:var(--cyan)]" />
              Data Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[color:var(--fg-mute)]">
              Export all your data as a JSON file for backup or migration.
            </p>

            {stats && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <StatBadge label="Tasks" value={stats.tasks} />
                <StatBadge label="Workouts" value={stats.templates} />
                <StatBadge label="Exercises" value={stats.exercises} />
                <StatBadge label="Diet Logs" value={stats.dietLogs} />
                <StatBadge label="Weight Logs" value={stats.weightLogs} />
                <StatBadge label="Supplements" value={stats.supplements} />
                <StatBadge label="Holdings" value={stats.holdings} />
                <StatBadge label="Journal" value={stats.journal} />
                <StatBadge label="Groceries" value={stats.groceries} />
                <StatBadge label="Goals" value={stats.goals} />
                <StatBadge label="Ideas" value={stats.ideas} />
                <StatBadge label="Total" value={stats.total} highlight />
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={isPending}
              className="w-full sm:w-auto bg-[color:var(--pink)] hover:bg-[#FF1565] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : exported ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card className="rounded-2xl bg-[var(--ink-100)] border-[color:var(--line)]">
          <CardHeader>
            <CardTitle className="text-base text-white">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                fetch("/api/logout", { method: "POST" }).then(() => {
                  window.location.href = "/login";
                });
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card className="rounded-2xl bg-[var(--ink-100)] border-[color:var(--line)]">
          <CardHeader>
            <CardTitle className="text-base text-white">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mark47 size={32} gradient />
              <div>
                <p className="text-sm font-semibold text-white">
                  elevan<span className="text-[color:var(--pink)]">.life</span> v2.0
                </p>
                <p className="text-xs text-[color:var(--fg-mute)]">
                  Personal dashboard by elevan
                </p>
              </div>
            </div>
            <p className="text-xs text-[color:var(--fg-mute)]/60">
              Timezone: Los Angeles (Pacific)
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-center ${
        highlight
          ? "bg-[color:var(--pink)]/15 border border-[color:var(--pink)]/30"
          : "bg-white/[0.03] border border-[color:var(--line-soft)]"
      }`}
    >
      <p
        className={`text-lg font-bold ${
          highlight ? "text-[color:var(--pink)]" : "text-[color:var(--fg)]"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[color:var(--fg-mute)]">{label}</p>
    </div>
  );
}
