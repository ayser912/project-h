import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipsViewer } from "@/components/video/clips-viewer";

export const metadata: Metadata = { title: "Clips" };

export default function WatchPage() {
  return (
    <Suspense>
      <ClipsViewer />
    </Suspense>
  );
}
