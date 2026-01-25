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
            <div className={`flex items-center justify-center ${monochrome ? 'grayscale opacity-90' : ''}`}>
                {/* Clean Image - No Glow/Background */}
                <img
                    src="/logo-icon.png"
                    alt="MyWallet Piggy"
                    width={size}
                    height={size}
                    className="object-contain relative z-10"
                />
            </div>

            {showText && (
                <div className="flex flex-col pt-1.5">
                    <span
                        className={`font-extrabold bg-clip-text text-transparent tracking-tight ${size > 40 ? 'text-2xl' : 'text-lg'
                            } ${monochrome
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
