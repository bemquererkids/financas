'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { getUnreadNotifications } from '@/app/actions/notification-actions';

interface NotificationItem {
    id: string;
    type: 'BILL' | 'BUDGET_RISK' | 'INFO';
    title: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Poll for notifications every 30s or on mount
        const fetchNotifs = async () => {
            const data = await getUnreadNotifications();
            setNotifications(data);
        };
        fetchNotifs();
    }, []);

    const highPriorityCount = notifications.filter(n => n.severity === 'HIGH').length;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className={`absolute top-2 right-2 h-2 w-2 rounded-full ${highPriorityCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-950 border-slate-800 p-0 shadow-2xl mr-4" align="end">
                <div className="p-3 border-b border-white/5 bg-slate-900/50">
                    <h4 className="font-semibold text-white text-sm">Notificações</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            Tudo tranquilo por aqui.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map(item => (
                                <div key={item.id} className="p-3 hover:bg-white/5 transition-colors flex gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.severity === 'HIGH' ? 'bg-red-500' : item.severity === 'MEDIUM' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{item.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{item.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
