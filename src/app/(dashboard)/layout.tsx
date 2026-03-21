import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ImmersionBadge } from "@/components/layout/ImmersionBadge";
import { ImmersionInitializer } from "@/components/layout/ImmersionInitializer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-layout">
      <ImmersionInitializer />
      <DashboardSidebar />
      <div className="dash-content">
        <DashboardHeader />
        <main className="dash-main">{children}</main>
      </div>
      <ImmersionBadge />
    </div>
  );
}
