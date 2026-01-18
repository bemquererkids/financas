import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MyWallet - Gestão Inteligente",
    description: "Sistema de gestão financeira pessoal e familiar",
};

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
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
