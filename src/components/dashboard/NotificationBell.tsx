'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, ArrowUp, ArrowDown, AlertTriangle, X } from 'lucide-react';
import { getNotifications } from '@/app/actions/financial-actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotificationItem {
    id: string;
    type: 'income' | 'expense' | 'alert';
    title: string;
    subtitle: string;
    date: string;
    icon: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data as NotificationItem[]);
                // Simulação simples: se tem dados, marca como "tem não lidas" na primeira vez
                // Num app real, usaríamos localStorage ou DB para saber o que foi lido
                if (data.length > 0) setHasUnread(true);
            } catch (e) {
                console.error("Failed to fetch notifications", e);
            }
        };
        fetchNotes();

        // Refresh every 60s
        const interval = setInterval(fetchNotes, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasUnread(false); // Mark as read when opening
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowUp className="h-4 w-4 text-emerald-500" />;
            case 'expense': return <ArrowDown className="h-4 w-4 text-red-500" />;
            case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Bell className="h-4 w-4 text-slate-400" />;
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                onClick={toggleOpen}
            >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-[#09090b] rounded-full animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl glass-card border border-white/10 bg-[#09090b]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <h4 className="font-semibold text-white text-sm">Notificações</h4>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs">
                                Nenhuma notificação recente.
                            </div>
                        ) : (
                            <div className="py-2">
                                {notifications.map((note) => (
                                    <div key={note.id} className="px-4 py-3 hover:bg-white/5 transition-colors flex gap-3 items-start border-b border-white/5 last:border-0 cursor-pointer">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full bg-opacity-10 shrink-0",
                                            note.type === 'income' && "bg-emerald-500/10",
                                            note.type === 'expense' && "bg-red-500/10",
                                            note.type === 'alert' && "bg-amber-500/10"
                                        )}>
                                            {getIcon(note.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-sm font-medium text-white truncate">{note.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{note.subtitle}</p>
                                            <p className="text-[10px] text-slate-500 pt-1">{formatDate(note.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-white/5 bg-white/5 text-center">
                        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors bg-transparent border-none">
                            Ver todas as atividades
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
