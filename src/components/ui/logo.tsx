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
               Brand Mark: "The Geometric Pig v2"
               Improved silhouette with distinct snout and ears.
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

                    {/* Main Body - Clear Pig Silhouette */}
                    {/* Constructed using rounded rectangles and boolean operations mentally */}
                    <path
                        fill={monochrome ? "currentColor" : "url(#brand_gradient)"}
                        d="M448 256C448 290 430 320 400 340V400C400 408.8 392.8 416 384 416H336C327.2 416 320 408.8 320 400V352H192V400C192 408.8 184.8 416 176 416H128C119.2 416 112 408.8 112 400V340C70 315 48 270 48 224C48 135.6 119.6 64 208 64H256C344.4 64 416 135.6 416 224V256H448ZM336 96L368 128H304L336 96Z"
                        filter={monochrome ? "" : "url(#dropShadow)"}
                        className={monochrome ? "text-slate-200" : ""}
                    />

                    {/* Ear Overlay (To smooth the connection) */}
                    <path d="M140 100 L180 64 H200 L160 120 Z" fill={monochrome ? "currentColor" : "url(#brand_gradient)"} />


                    {/* Glass/Shine Overlay for Depth */}
                    {!monochrome && (
                        <path
                            fill="url(#shine_gradient)"
                            d="M448 256C448 290 430 320 400 340V400C400 408.8 392.8 416 384 416H336C327.2 416 320 408.8 320 400V352H192V400C192 408.8 184.8 416 176 416H128C119.2 416 112 408.8 112 400V340C70 315 48 270 48 224C48 135.6 119.6 64 208 64H256C344.4 64 416 135.6 416 224V256H448ZM336 96L368 128H304L336 96Z"
                            style={{ mixBlendMode: 'overlay' }}
                        />
                    )}

                    {/* Coin Slot */}
                    <rect x="208" y="144" width="96" height="12" rx="6" fill="white" fillOpacity={monochrome ? 0.3 : 0.9} />

                    {/* Eye */}
                    <circle cx="350" cy="200" r="14" fill="white" fillOpacity={monochrome ? 0.3 : 0.9} />

                    {/* Snout Detail */}
                    <path d="M416 256H432C440.8 256 448 250 448 240V230C448 221.2 440.8 214 432 214H416V256Z" fill="white" fillOpacity="0.2" />

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
