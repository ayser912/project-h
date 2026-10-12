import { Suspense } from "react";
import { ExploreView } from "@/components/explore/explore-view";

export default function ExplorePage() {
  // Search reads ?q= from the URL, so it renders inside a Suspense boundary.
  return (
    <Suspense>
      <ExploreView />
    </Suspense>
  );
}
