"use client";

import { useState } from "react";
import type { ReportReason } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

const REASONS: ReportReason[] = [
  "misinformation",
  "dangerous_advice",
  "patient_privacy",
  "impersonation",
  "undisclosed_ad",
  "harassment",
  "spam",
  "other",
];

export function ReportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (reason: ReportReason, details: string) => void;
  onCancel: () => void;
}) {
  const { m } = useI18n();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason) {
          setError(true);
          return;
        }
        onSubmit(reason, details.trim().slice(0, 1000));
      }}
    >
      <fieldset>
        <legend className="sr-only">{m.report.intro}</legend>
        <div className="space-y-1.5">
          {REASONS.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 ring-1 ring-inset transition-colors",
                reason === r ? "bg-accent-soft ring-primary" : "ring-line hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => {
                  setReason(r);
                  setError(false);
                }}
                className="size-4 accent-[var(--ph-primary)]"
              />
              <span className="text-sm font-medium">{m.report.reasons[r]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {m.report.pickReason}
        </p>
      )}
      <label className="mt-4 block">
        <span className="text-sm font-medium">{m.report.details}</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={1000}
          dir="auto"
          aria-describedby="report-details-hint"
          className="mt-1.5 w-full resize-none rounded-2xl bg-surface-2 p-3 text-sm ring-1 ring-inset ring-line focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span id="report-details-hint" className="text-xs text-muted">
          {m.report.detailsHint}
        </span>
      </label>
      <p className="mt-3 text-xs text-muted">{m.report.urgent}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {m.common.cancel}
        </Button>
        <Button type="submit">{m.report.submit}</Button>
      </div>
    </form>
  );
}
