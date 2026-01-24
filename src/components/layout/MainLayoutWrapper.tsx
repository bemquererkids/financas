'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { UserGreeting } from "@/components/profile/UserGreeting";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { SplashScreen } from '@/components/layout/SplashScreen';
import { Logo } from '@/components/ui/logo';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const isAuthPage = pathname?.startsWith('/auth');

    useEffect(() => {
        const stored = localStorage.getItem('sidebarCollapsed');
        if (stored) {
            setIsCollapsed(JSON.parse(stored));
        }

        // Register Custom Service Worker for PWA & Push
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/custom-sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    if (isAuthPage) {
        return <div className="h-full w-full">{children}</div>;
    }

    const getChatContext = () => {
        if (pathname?.includes('/goals')) return 'goals';
        if (pathname?.includes('/investments')) return 'investments';
        if (pathname?.includes('/payments')) return 'payments';
        return 'general';
    };

    const getWelcomeMessage = () => {
        const ctx = getChatContext();
        switch (ctx) {
            case 'goals': return "Olá! Sou seu estrategista de metas. Vamos planejar seus sonhos?";
            case 'investments': return "Olá! Sou seu consultor de investimentos. Onde você quer chegar financeiramente?";
            case 'payments': return "Olá! Precisa de ajuda para organizar suas contas e vencimentos?";
            default: return "Olá! Sou seu assistente financeiro pessoal. Como posso ajudar hoje?";
        }
    };

    return (
        <>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

            {/* Sidebar Desktop */}
            <div className={cn(
                "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300",
                isCollapsed ? "md:w-[72px]" : "md:w-72"
            )}>
                <Sidebar collapsed={isCollapsed} onToggle={toggleSidebar} />
            </div>

            {/* Mobile Navbar with Notification */}
            <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-[#111827] border-b border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <MobileSidebar />
                    <Logo size={28} showText={true} />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                        <Sparkles className="h-5 w-5" />
                    </Button>
                    <NotificationBell />
                    <UserGreeting />
                </div>
            </div>

            {/* Main Content */}
            <main className={cn(
                "pt-16 md:pt-0 pb-10 h-full transition-all duration-300",
                isCollapsed ? "md:pl-[72px]" : "md:pl-72"
            )}>
                {children}
            </main>

            {/* AI Chatbot - Global Context Aware */}
            <ChatWidget
                isOpen={isChatOpen}
                onOpenChange={setIsChatOpen}
                context={getChatContext()}
                welcomeMessage={getWelcomeMessage()}
            />
        </>
    );
}
