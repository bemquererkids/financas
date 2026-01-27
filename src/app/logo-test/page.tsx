import React from 'react';
import { Logo } from '@/components/ui/Logo';

export default function LogoExportPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            {/* Render a huge version of the logo for high-quality capture */}
            <div id="capture-target" className="p-4">
                <Logo size={1024} showText={false} />
            </div>
        </div>
    );
}
