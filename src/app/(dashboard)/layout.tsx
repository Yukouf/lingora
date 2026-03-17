import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-layout">
      <DashboardSidebar />
      <div className="dash-content">
        <DashboardHeader />
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}
