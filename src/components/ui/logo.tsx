import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    monochrome?: boolean;
}

export function Logo({ className = "", size = 32, showText = true, monochrome = false }: LogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* 
               Brand Mark: "The Geometric Pig"
               A pure SVG vector constructed from circular arcs and rounded rectangles.
               Scales infinitely, zero pixelation.
            */}
            <div className={`relative flex items-center justify-center ${monochrome ? 'opacity-90' : ''}`}>
                <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="brand_gradient" x1="0" y1="512" x2="512" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#10b981" />   {/* Emerald 500 */}
                            <stop offset="50%" stopColor="#0ea5e9" />   {/* Sky 500 */}
                            <stop offset="100%" stopColor="#6366f1" />  {/* Indigo 500 */}
                        </linearGradient>
                        <linearGradient id="shine_gradient" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
                        </filter>
                    </defs>

                    {/* Main Body - Smooth Rounded Shape */}
                    <path
                        fill={monochrome ? "currentColor" : "url(#brand_gradient)"}
                        d="M416 288C416 358.7 358.7 416 288 416H152C134.3 416 120 401.7 120 384V330C86.7 312 64 277 64 237C64 179.6 110.6 133 168 133H192V112C192 94.3 206.3 80 224 80H256C273.7 80 288 94.3 288 112V133H312C369.4 133 416 179.6 416 237V288Z"
                        filter={monochrome ? "" : "url(#dropShadow)"}
                        className={monochrome ? "text-slate-200" : ""}
                    />

                    {/* Glass/Shine Overlay for Depth */}
                    {!monochrome && (
                        <path
                            fill="url(#shine_gradient)"
                            d="M416 288C416 358.7 358.7 416 288 416H152C134.3 416 120 401.7 120 384V330C86.7 312 64 277 64 237C64 179.6 110.6 133 168 133H192V112C192 94.3 206.3 80 224 80H256C273.7 80 288 94.3 288 112V133H312C369.4 133 416 179.6 416 237V288Z"
                            style={{ mixBlendMode: 'overlay' }}
                        />
                    )}

                    {/* Coin Slot - Crisp White Pill */}
                    <rect x="208" y="160" width="96" height="16" rx="8" fill="white" fillOpacity={monochrome ? 0.3 : 0.9} />

                    {/* Eye - Simple Dot */}
                    <circle cx="340" cy="220" r="16" fill="white" fillOpacity={monochrome ? 0.3 : 0.9} />

                </svg>
            </div>

            {showText && (
                <div className="flex flex-col justify-center">
                    <span
                        className={`font-semibold tracking-tight ${size > 40 ? 'text-2xl' : 'text-lg'
                            } ${monochrome
                                ? 'text-slate-200'
                                : 'text-white'
                            }`}
                    >
                        MyWallet
                    </span>
                </div>
            )}
        </div>
    );
}
