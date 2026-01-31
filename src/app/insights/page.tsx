import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightsPageTrack } from "@/components/insights-page-track";

const ChatInterface = dynamic(
  () => import("@/components/chat-interface").then((m) => ({ default: m.ChatInterface })),
  {
    ssr: true,
    loading: () => (
      <div className="flex h-screen w-full overflow-hidden bg-[#0b0b0b] items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-sm text-white/60">Loading chat…</p>
        </div>
      </div>
    ),
  }
);

export default function InsightsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <InsightsPageTrack />
      <ChatInterface />
    </div>
  );
}
