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

                {/* Vector Polygonal Piggy Bank */}
                <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
                            <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
                            <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
                        </linearGradient>
                    </defs>

                    {/* Main Body Wireframe */}
                    <path
                        d="M4 32 L16 16 L24 8 L32 16 L56 20 L60 40 L52 56 L32 48 L20 56 L12 44 Z"
                        stroke="url(#poly-grad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Internal Triangulation Lines */}
                    <path
                        d="M16 16 L32 48 M16 16 L12 44 M32 16 L32 48 M32 16 L52 56 M32 16 L60 40 M56 20 L32 48 M12 44 L32 48 M20 56 L32 48"
                        stroke="url(#poly-grad)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                    />

                    {/* Eye */}
                    <circle cx="16" cy="24" r="1.5" fill="#22d3ee" />

                    {/* Tail */}
                    <path d="M56 20 L62 16" stroke="url(#poly-grad)" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span
                        className={`text-lg font-bold bg-clip-text text-transparent ${monochrome
                                ? 'bg-slate-200'
                                : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-500'
                            }`}
                    >
                        MyWallet
                    </span>
                </div>
            )}
        </div>
    );
}
