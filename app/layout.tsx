import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "WorkforceOne | Remote Workforce Management",
  description: "The complete operating system for field teams. Manage patrols, payroll, forms, and assets in one white-label platform. Deploy on-cloud or on-premise.",
  keywords: ["remote workforce management", "field operations software", "white label SaaS", "mobile forms builder", "security patrol software", "hr and payroll", "on-premise deployment"],
  openGraph: {
    title: "WorkforceOne | Remote Workforce Management",
    description: "Streamline your field operations with WorkforceOne. The modular platform for security, HR, and logistics.",
    type: "website",
    url: "https://workforceone.com",
    siteName: "WorkforceOne",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkforceOne",
    description: "The operating system for field operations. Built for scale.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans antialiased", inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
