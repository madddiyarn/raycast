import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { Providers } from "@/components/providers";

const font = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Raycast — умная платформа вакансий",
  description: "AI vacancy ingestion and employment matching platform for youth and small businesses in Mangystau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f8f9fc] text-slate-900">
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
