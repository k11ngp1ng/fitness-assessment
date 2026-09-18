import { Suspense } from "react";
import { AssessmentWizard } from "@/features/assessments/wizard";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AssessmentWizard />
    </Suspense>
  );
}
