import React from 'react';
import { PiggyBank } from 'lucide-react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    monochrome?: boolean;
}

export function Logo({ className = "", size = 32, showText = true, monochrome = false }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`relative flex items-center justify-center ${monochrome ? 'grayscale opacity-90' : ''}`}>
                {/* Glow Effect - Restored from Original */}
                {!monochrome && <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />}

                {/* Custom SVG Icon - Restored from Original ("Connected Line" Design) */}
                <div className="relative">
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" /> {/* Blue start */}
                                <stop offset="100%" stopColor="#10b981" /> {/* Emerald end */}
                            </linearGradient>
                        </defs>
                        <path
                            d="M19 5C19 5 18 5 18 7V8C18 8 16.5 6 14 6C11.5 6 10 7.5 9 9L6 12L4 12C3 12 2 13 2 14V16C2 17 3 18 4 18H5V20C5 21.1 5.9 22 7 22H9C10.1 22 11 21.1 11 20V19H13V20C13 21.1 13.9 22 15 22H17C18.1 22 19 21.1 19 20V16C21 15 22 13 22 11C22 9 21 8 19 8V5Z"
                            stroke="url(#logo-gradient)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                        {/* The "Plug/Tail" Accent Line */}
                        <path
                            d="M2 11C2 9 3 7 5 6"
                            stroke="url(#logo-gradient)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Circle/Dot Accent */}
                        <circle cx="5" cy="6" r="1.5" fill="#10b981" />
                    </svg>
                </div>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span
                        className={`text-lg font-bold bg-clip-text text-transparent ${monochrome
                                ? 'bg-slate-200'
                                : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                            }`}
                    >
                        MyWallet
                    </span>
                </div>
            )}
        </div>
    );
}
