'use client';

import { useState } from 'react';
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { ChatWidget } from "@/components/ai/ChatWidget";

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <ModuleHeader
                title={title}
                subtitle={subtitle}
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
            />
            <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </>
    );
}
