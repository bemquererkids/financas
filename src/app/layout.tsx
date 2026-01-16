import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Controle Financeiro RNV",
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
                    {/* Sidebar Desktop */}
                    <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                        <Sidebar />
                    </div>

                    {/* Main Content */}
                    <main className="md:pl-72 pb-10">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
