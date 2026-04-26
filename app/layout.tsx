import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relógio do Juízo Final",
  description: "O contador regressivo do apocalipse — Anno Domini MMXXVI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}