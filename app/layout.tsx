import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/lib/providers";
import { AuthProvider } from "@/src/contexts/auth-context";

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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

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
        <AuthProvider>
          <RootProviders>{children}</RootProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
