import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { UserGreeting } from "@/components/profile/UserGreeting";

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
                    <AuthProvider>
                        {/* Sidebar Desktop */}
                        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                            <Sidebar />
                        </div>



                        {/* Mobile Navbar */}
                        <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-[#111827] border-b border-white/10">
                            <div className="flex items-center">
                                <MobileSidebar />
                                <span className="ml-4 font-bold text-lg text-white">RNV Control</span>
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
