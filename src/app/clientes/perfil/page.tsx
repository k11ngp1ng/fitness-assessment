import { Suspense } from "react";
import { Loading } from "@/components/ui";
import { RecordPage } from "@/components/record-page";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <RecordPage kind="client" />
    </Suspense>
  );
}
