import { BottomNav, Sidebar, Header, FAB } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0e0e1a] to-[#0a0a14]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:max-h-screen md:overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <FAB />
      </div>
    </div>
  );
}
