'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, ArrowUp, ArrowDown, AlertTriangle, X, CheckCircle } from 'lucide-react';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Estados persistentes
    const [lastMarkAllRead, setLastMarkAllRead] = useState<number>(0);
    const [readItemIds, setReadItemIds] = useState<string[]>([]);

    useEffect(() => {
        // Carregar estados iniciais do localStorage
        if (typeof window !== 'undefined') {
            const storedLastRead = localStorage.getItem('lastMarkAllReadTime');
            const storedReadIds = localStorage.getItem('readItemIds');
            if (storedLastRead) setLastMarkAllRead(Number(storedLastRead));
            if (storedReadIds) setReadItemIds(JSON.parse(storedReadIds));
        }

        fetchNotes();
        const interval = setInterval(fetchNotes, 60000);
        return () => clearInterval(interval);
    }, []);

    // Recalcular contagem sempre que notificações ou estados de leitura mudarem
    useEffect(() => {
        const count = notifications.filter(n => !isRead(n)).length;
        setUnreadCount(count);
    }, [notifications, lastMarkAllRead, readItemIds]);

    const fetchNotes = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data as NotificationItem[]);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    const isRead = (item: NotificationItem) => {
        const itemTime = new Date(item.date).getTime();
        // É lido se: data do item for anterior ao 'Marcar todos como lido' OU se o ID estiver na lista de lidos manuais
        return itemTime <= lastMarkAllRead || readItemIds.includes(item.id);
    };

    const markItemAsRead = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!readItemIds.includes(id)) {
            const newIds = [...readItemIds, id];
            setReadItemIds(newIds);
            localStorage.setItem('readItemIds', JSON.stringify(newIds));
        }
    };

    const markAllAsRead = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const now = Date.now();
        setLastMarkAllRead(now);
        setReadItemIds([]); // Limpa lista individual pois o 'global' já cobre tudo para trás
        localStorage.setItem('lastMarkAllReadTime', String(now));
        localStorage.setItem('readItemIds', JSON.stringify([]));
    };

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

    const toggleOpen = () => setIsOpen(!isOpen);

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowUp className="h-4 w-4 text-emerald-500" />;
            case 'expense': return <ArrowDown className="h-4 w-4 text-rose-500" />;
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
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-[#09090b] rounded-full animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl glass-card border border-white/10 bg-[#09090b]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white text-sm">Notificações</h4>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                                    {unreadCount} novas
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
                                    title="Marcar todas como lidas"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNotifications([]);
                                        setReadItemIds([]);
                                        localStorage.setItem('readItemIds', JSON.stringify([]));
                                    }}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
                                    title="Limpar todas"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                title="Fechar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                                <Bell className="h-8 w-8 opacity-20" />
                                Nenhuma notificação recente.
                            </div>
                        ) : (
                            <div className="py-1">
                                {notifications.map((note) => {
                                    const read = isRead(note);
                                    return (
                                        <div
                                            key={note.id}
                                            onClick={() => markItemAsRead(note.id)}
                                            className={cn(
                                                "px-4 py-3 flex gap-3 items-start border-b border-white/5 last:border-0 cursor-pointer transition-all hover:bg-white/5",
                                                read
                                                    ? "opacity-60"
                                                    : "bg-emerald-500/5 border-l-2 border-l-emerald-500"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-1 p-2 rounded-full shrink-0",
                                                read ? "bg-white/5" : "bg-white/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                                                note.type === 'expense' && !read && "shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                            )}>
                                                {getIcon(note.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={cn(
                                                        "text-sm truncate pr-2",
                                                        read ? "font-medium text-slate-300" : "font-bold text-white"
                                                    )}>
                                                        {note.title}
                                                    </p>
                                                    {!read && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>}
                                                </div>
                                                <p className={cn(
                                                    "text-xs truncate",
                                                    read ? "text-slate-500" : "text-slate-300"
                                                )}>
                                                    {note.subtitle}
                                                </p>
                                                <p className="text-[10px] text-slate-500 pt-1">{formatDate(note.date)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-white/5 bg-white/5 text-center">
                        <button className="text-xs text-slate-400 hover:text-white transition-colors bg-transparent border-none">
                            Ver histórico completo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
