"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Dialog } from "@/components/ui/dialog";

/** Persistent reminder that this build runs on fictional data and device-only storage. */
export function DemoBanner() {
  const { m } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 bg-pending-bg px-4 py-2 text-[0.8rem] text-pending">
        <FlaskConical className="size-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 leading-5">{m.demoBanner.text}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full px-2.5 py-1 font-semibold underline-offset-2 hover:underline"
        >
          {m.demoBanner.learn}
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={m.common.demoData}>
        <p className="text-sm text-muted">{m.demoBanner.details}</p>
      </Dialog>
    </>
  );
}
