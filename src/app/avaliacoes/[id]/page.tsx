import { Suspense } from "react";
import { Results } from "@/features/assessments/results";
import { assessments } from "@/data/seed";

export function generateStaticParams() {
  return assessments.map((assessment) => ({ id: assessment.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <Results id={(await params).id} />
    </Suspense>
  );
}
