import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MyWallet - Gestão Inteligente",
    description: "Sistema de gestão financeira pessoal e familiar",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
        shortcut: "/favicon.ico",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "MyWallet"
    }
};

import { FloatingChat } from "@/components/chat/FloatingChat";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark">
            <body className={`${inter.className} bg-slate-950 min-h-screen`}>
                <div className="h-full relative">
                    <AuthProvider>
                        <MainLayoutWrapper>
                            {children}
                        </MainLayoutWrapper>
                        <FloatingChat />
                        <Toaster />
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
