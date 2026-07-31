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
  title: "IÓN MAX MARKET SOCIAL - Marketplace & Red Social",
  description: "ION MAX MARKET SOCIAL: La plataforma que combina marketplace premium con red social profesional. Compra, vende y conecta.",
  keywords: "marketplace, red social, tienda online, comunidad, ecuador, negocios",
  manifest: "/manifest.json",
  themeColor: "#facc15",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IÓN MAX MARKET SOCIAL",
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
import { DeviceProvider } from "@/src/contexts/device-context";

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
            <DeviceProvider>
              <RootProviders>
                <ServiceWorkerRegister />
                
                {/* Skip Link para Accesibilidad WCAG */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black z-50"
                >
                  Saltar al contenido principal
                </a>
                
                <GlobalNav />
                <main id="main-content" className="pt-16">
                  {children}
                </main>
                <MobileBottomNav />
                <CommandPalette />
              </RootProviders>
            </DeviceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
