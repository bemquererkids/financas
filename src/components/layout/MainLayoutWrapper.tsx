'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { UserGreeting } from "@/components/profile/UserGreeting";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { PiggyBank, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isAuthPage = pathname?.startsWith('/auth');

    if (isAuthPage) {
        return <div className="h-full w-full">{children}</div>;
    }

    return (
        <>
            {/* Sidebar Desktop */}
            <div className={cn(
                "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300",
                isCollapsed ? "md:w-[80px]" : "md:w-72"
            )}>
                <Sidebar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            </div>

            {/* Mobile Navbar with Notification */}
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Button>
                    <NotificationBell />
                    <UserGreeting />
                </div>
            </div>

            {/* Main Content */}
            <main className={cn(
                "pt-16 md:pt-0 pb-10 h-full transition-all duration-300",
                isCollapsed ? "md:pl-[80px]" : "md:pl-72"
            )}>
                {children}
            </main>

            {/* AI Chatbot */}
            <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </>
    );
}
