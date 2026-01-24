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
                {/* Glow Effect - Only if not monochrome */}
                {!monochrome && <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />}

                <img
                    src="/logo-icon.png"
                    alt="MyWallet Piggy"
                    width={size}
                    height={size}
                    className="object-contain drop-shadow-md relative z-10"
                />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span
                        className={`text-lg font-bold bg-clip-text text-transparent ${monochrome
                                ? 'bg-slate-200'
                                : 'bg-gradient-to-r from-emerald-400 to-purple-500'
                            }`}
                    >
                        MyWallet
                    </span>
                </div>
            )}
        </div>
    );
}
