import { BottomNav, Sidebar, Header, FAB } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
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
