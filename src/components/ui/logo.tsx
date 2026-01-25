import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    monochrome?: boolean;
}

export function Logo({ className = "", size = 32, showText = true, monochrome = false }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* 
                Premium Fintech Logo: "The Secure Piggy"
                Constructed with solid geometric shapes for maximum legibility and trust.
            */}
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="premium-gradient" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#059669" />   {/* Deep Emerald */}
                            <stop offset="100%" stopColor="#34d399" /> {/* Bright Emerald */}
                        </linearGradient>
                        <linearGradient id="coin-gradient" x1="10" y1="0" x2="30" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#F59E0B" />   {/* Amber/Gold */}
                            <stop offset="100%" stopColor="#FCD34D" /> {/* Light Gold */}
                        </linearGradient>
                        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                        </filter>
                    </defs>

                    {/* Main Body - Solid & Trustworthy */}
                    <path
                        fill={monochrome ? "currentColor" : "url(#premium-gradient)"}
                        d="M36 20C36 28.8366 28.8366 36 20 36C12.5 36 6.2 31.0 4.5 24.0C4.1 22.5 4 21 4 20C4 11.1634 11.1634 4 20 4C28.8366 4 36 11.1634 36 20Z"
                        className={monochrome ? "text-slate-200" : ""}
                    />

                    {/* The Coin / Slot - Suggests Investment/Savings */}
                    <circle cx="20" cy="14" r="3" fill="white" fillOpacity="0.2" />
                    <rect x="17" y="13" width="6" height="2" rx="1" fill="white" />

                    {/* Minimalist Piggy Details (Snout & Ear) - Subtractive Geometry */}
                    <path
                        d="M32 20C32 21.5 31 22.5 30 23V17C31 17.5 32 18.5 32 20Z"
                        fill={monochrome ? "#0f172a" : "#065f46"} // Darker shade for contrast
                        fillOpacity="0.3"
                    />
                    {/* Ear */}
                    <path
                        d="M24 6L28 10L23 11L24 6Z"
                        fill={monochrome ? "#0f172a" : "#022c22"}
                        fillOpacity="0.2"
                    />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col justify-center">
                    <span
                        className={`font-bold tracking-tight leading-none ${size > 40 ? 'text-2xl' : 'text-xl'
                            } ${monochrome
                                ? 'text-slate-200'
                                : 'text-white'
                            }`}
                    >
                        MyWallet
                    </span>
                    {size > 40 && !monochrome && (
                        <span className="text-[10px] text-emerald-500 font-medium tracking-widest uppercase ml-0.5">
                            Gestão Inteligente
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
