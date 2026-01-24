import React from 'react';
import { PiggyBank } from 'lucide-react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />

                {/* Icon with Gradient */}
                <div className="relative">
                    <svg width="0" height="0">
                        <linearGradient id="logo-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop stopColor="#10b981" offset="0%" />
                            <stop stopColor="#3b82f6" offset="100%" />
                        </linearGradient>
                    </svg>
                    <PiggyBank
                        size={size}
                        style={{ stroke: "url(#logo-gradient)" }}
                        className="text-emerald-500 drop-shadow-sm"
                        strokeWidth={1.5}
                    />
                </div>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                        MyWallet
                    </span>
                </div>
            )}
        </div>
    );
}
