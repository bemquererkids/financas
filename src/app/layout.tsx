import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { UserGreeting } from "@/components/profile/UserGreeting";
import { PiggyBank } from "lucide-react";

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
                        {/* Sidebar Desktop */}
                        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                            <Sidebar />
                        </div>

                        {/* Mobile Navbar */}
                        <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-[#111827] border-b border-white/10 shadow-lg shadow-black/20">
                            <div className="flex items-center gap-3">
                                <MobileSidebar />
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <PiggyBank className="h-5 w-5 text-slate-900" />
                                    </div>
                                    <span className="font-bold text-lg text-white">MyWallet</span>
                                </div>
                            </div>
                            <UserGreeting />
                        </div>

                        {/* Main Content */}
                        <main className="md:pl-72 pt-16 md:pt-0 pb-10">
                            {children}
                        </main>

                        {/* AI Chatbot */}
                        <ChatWidget />
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
