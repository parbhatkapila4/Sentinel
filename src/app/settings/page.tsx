import { Suspense } from "react";
import {
  SettingsPageClient,
  SettingsLoadingFallback,
} from "@/components/settings/settings-page-client";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoadingFallback />}>
      <SettingsPageClient />
    </Suspense>
  );
}
