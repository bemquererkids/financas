'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

export function UserGreeting() {
    const { data: session, status } = useSession();

    const hour = new Date().getHours();
    let greeting = 'Olá';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    if (status === "loading") {
        return <div className="h-10 w-32 bg-slate-800/50 animate-pulse rounded-full" />;
    }

    if (!session) {
        return (
            <Button
                onClick={() => signIn("google")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-2 shadow-lg shadow-emerald-500/20"
                size="sm"
            >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar com Google</span>
                <span className="sm:hidden">Entrar</span>
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="relative group">
                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold border-2 border-white/10">
                        <span className="text-sm">{session.user?.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}</span>
                    </div>
                )}
            </div>

            <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-400 font-medium">{greeting},</p>
                <p className="text-sm font-bold text-white leading-tight truncate max-w-[120px]">
                    {session.user?.name?.split(' ')[0]}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                title="Sair"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    );
}
