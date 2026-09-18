import type { Metadata } from "next";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "Vértice · Performance Lab",
  description:
    "Precisão em cada evolução. Plataforma de avaliação física para personal trainers.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#main-content">
          Pular para conteúdo
        </a>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
