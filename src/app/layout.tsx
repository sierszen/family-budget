import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Budget - Inteligentne zarządzanie budżetem rodzinnym",
  description: "Nowoczesna aplikacja do zarządzania budżetem rodzinnym z AI, wykresami i analizami",
  keywords: "budżet rodzinny, finanse, zarządzanie pieniędzmi, AI, analiza wydatków",
  authors: [{ name: "Family Budget Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
