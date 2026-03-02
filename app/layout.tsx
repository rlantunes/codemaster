import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeMaster — Aprenda a Programar com IA",
  description: "Aprenda Python, JavaScript, Java e muito mais com um tutor de IA personalizado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
        </head>
        <body style={{ margin: 0, padding: 0, fontFamily: "'Outfit', sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
