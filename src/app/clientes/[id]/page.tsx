import { ClientProfile } from "@/features/clients/profile";
import { clients } from "@/data/seed";

export function generateStaticParams() {
  return clients.map((client) => ({ id: client.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ClientProfile id={(await params).id} />;
}
