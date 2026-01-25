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
               Brand Mark: "The Reference Piggy"
               Strictly modeled after the requested Icons8 reference.
               Side view, facing left, coin dropping in.
            */}
            <div className={`relative flex items-center justify-center ${monochrome ? 'opacity-90' : ''}`}>
                <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="body_gradient" x1="0" y1="512" x2="512" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#10b981" />   {/* Emerald 500 */}
                            <stop offset="50%" stopColor="#0ea5e9" />   {/* Sky 500 */}
                            <stop offset="100%" stopColor="#6366f1" />  {/* Indigo 500 */}
                        </linearGradient>
                        <linearGradient id="coin_gradient" x1="200" y1="50" x2="280" y2="150" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fbbf24" />   {/* Amber 400 */}
                            <stop offset="100%" stopColor="#d97706" /> {/* Amber 600 */}
                        </linearGradient>
                        <filter id="soft_shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.2" />
                        </filter>
                    </defs>

                    {/* Gold Coin Dropping In (Above Slot) */}
                    {!monochrome && (
                        <g filter="url(#soft_shadow)">
                            <circle cx="256" cy="100" r="36" fill="url(#coin_gradient)" />
                            {/* Inner detail of coin */}
                            <circle cx="256" cy="100" r="28" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" />
                            <path d="M256 86V114M248 90C248 90 264 90 264 96C264 102 248 102 248 108C248 114 264 114 264 114" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </g>
                    )}

                    {/* Main Piggy Body - Side View Facing Left */}
                    {/* Path traces: Snout -> Head -> Ear -> Back -> Rump -> Tail -> Leg -> Belly -> Leg -> Snout */}
                    <path
                        fill={monochrome ? "currentColor" : "url(#body_gradient)"}
                        d="M416 234.3C416 195.8 402.7 160.7 379.8 132.8C356.5 104.4 321.6 85.3 282.7 76.5V64H229.3V76.5C148.8 85.2 84.6 148.5 76.5 229.3H64V282.7H76.5C80.3 320.9 99.4 355.8 127.8 379.1V448H192V408H320V448H384.2V379.1C403.4 363.3 416 339.4 416 312.7V296C433.7 296 448 281.7 448 264V256C448 244 434 234.3 416 234.3ZM128 176C136.8 176 144 183.2 144 192C144 200.8 136.8 208 128 208C119.2 208 112 200.8 112 192C112 183.2 119.2 176 128 176Z"
                        filter={monochrome ? "" : "url(#soft_shadow)"}
                        className={monochrome ? "text-slate-200" : ""}
                    />

                    {/* Slot Detail on Back */}
                    <rect x="229" y="96" width="54" height="10" rx="5" fill="black" fillOpacity="0.2" />

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
