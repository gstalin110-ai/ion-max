import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/lib/providers";
import { AuthProvider } from "@/src/contexts/auth-context";
import { LanguageProvider } from "@/src/contexts/language-context";
import ServiceWorkerRegister from "@/src/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IÓN MAX - Lujo, Educación & Servicios",
  description: "La marca que redefine la autoridad digital. Productos premium, cursos innovadores y servicios de alto valor.",
  keywords: "lujo, tecnología, cursos online, servicios digitales, autoridad online",
  manifest: "/manifest.json",
  themeColor: "#facc15",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IÓN MAX",
  },
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

import { GlobalNav } from "@/src/components/layout/global-nav";
import { MobileBottomNav } from "@/src/components/mobile-bottom-nav";
import { CommandPalette } from "@/src/components/command-palette";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <RootProviders>
              <ServiceWorkerRegister />
              <GlobalNav />
              <div className="pt-16">{children}</div>
              <MobileBottomNav />
              <CommandPalette />
            </RootProviders>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
