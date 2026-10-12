"use client";

import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

/** Route-level error boundary: explains what happened and offers a retry. */
export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { m } = useI18n();
  return (
    <EmptyState
      icon={<TriangleAlert className="size-6" />}
      title={m.errorPage.title}
      body={m.errorPage.body}
      action={<Button onClick={reset}>{m.common.retry}</Button>}
    />
  );
}
