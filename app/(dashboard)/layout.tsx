import { BottomNav, Sidebar, Header, FAB } from "@/components/layout";
import { InstallBanner } from "@/components/install-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(1100px 700px at 30% -5%, rgba(157,78,221,0.10), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(255,45,120,0.08), transparent 60%), var(--ink-000)",
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col lg:max-h-screen lg:overflow-hidden">
        <InstallBanner />
        <Header />
        <main
          className="flex-1 overflow-auto lg:pb-8"
          style={{
            // Bottom nav is ~88px tall floating 14px above the screen edge,
            // plus the iOS bottom safe-area inset on notched phones. On
            // desktop (lg+) the bottom nav is hidden so we just use a small
            // bottom pad — overridden by lg:pb-8 above.
            paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
          }}
        >
          <div className="page-shell">{children}</div>
        </main>
        <BottomNav />
        <FAB />
      </div>
    </div>
  );
}
