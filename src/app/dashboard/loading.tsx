import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-full p-8 bg-[#0b0b0b] max-sm:p-4 max-sm:overflow-x-hidden">
        <DashboardSkeleton />
      </div>
    </DashboardLayout>
  );
}
