import { Suspense } from "react";
import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  // The language switch reads the query string, so render inside Suspense.
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
