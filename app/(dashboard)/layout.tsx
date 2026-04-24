import { BottomNav, Sidebar, Header, FAB } from "@/components/layout";

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
      <div className="flex-1 flex flex-col md:max-h-screen md:overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pb-24 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <FAB />
      </div>
    </div>
  );
}
