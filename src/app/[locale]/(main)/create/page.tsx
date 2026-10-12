import { Suspense } from "react";
import { Composer } from "@/components/create/composer";

export default function CreatePage() {
  // Reads ?topic= and ?type= so it renders inside a Suspense boundary.
  return (
    <Suspense>
      <Composer />
    </Suspense>
  );
}
