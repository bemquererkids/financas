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
               Brand Mark: "The Modern Piggy"
               Inspired by clean, rounded icon styles.
               Features: Curly tail, distinct legs, drop-in coin.
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

                    {/* Gold Coin Dropping In */}
                    {!monochrome && (
                        <circle cx="256" cy="80" r="32" fill="url(#coin_gradient)" filter="url(#soft_shadow)" />
                    )}
                    {/* Coin Symbol ($) */}
                    {!monochrome && (
                        <path d="M256 64V96M248 68C248 68 264 68 264 74C264 80 248 80 248 86C248 92 264 92 264 92" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    )}

                    {/* Main Piggy Body */}
                    <path
                        fill={monochrome ? "currentColor" : "url(#body_gradient)"}
                        d="M448 240C448 247 447.1 253.9 445.4 260.5L462.2 272.7C468.9 277.6 471.2 286.8 467.6 294.3L452.2 326.6C448.1 335.2 437.9 338.3 429.8 333.6L412.3 323.5C397.7 348.5 376.5 369.4 351.3 383.8L359.5 419.8C361.6 429.1 355.7 438.4 346.4 440.6L311.2 449C301.9 451.1 292.6 445.2 290.4 435.9L283.4 405.3C274.5 406.8 265.3 407.6 256 407.6C239.5 407.6 223.5 405.1 208.3 400.4L195.9 437.6C192.9 446.6 183.1 451.4 174.1 448.4L140.5 437.2C131.5 434.2 126.7 424.4 129.7 415.4L142 378.5C110 357.6 86.6 326.8 74.5 290.7C74.3 290.2 74.2 289.8 74 289.4C69 292 63.4 293.4 57.4 293.4C40.6 293.4 27 279.8 27 263C27 246.2 40.6 232.6 57.4 232.6C59.9 232.6 62.3 232.9 64.6 233.4C66.8 198.9 80.7 167.3 103.5 142.1L82.9 116.3C77.4 109.4 78.5 99.3 85.4 93.8L112.7 72C119.6 66.5 129.7 67.6 135.2 74.5L157.6 102.5C186.3 87.7 219.7 79 255.4 79C265.4 79 275.2 79.7 284.7 81C283.5 86.8 285.5 92.7 289.6 96.8C296.2 103.4 306.8 103.4 313.4 96.8C319.4 90.8 320.1 81.6 315.6 74.9C391.8 84.6 448 156.4 448 240Z"
                        filter={monochrome ? "" : "url(#soft_shadow)"}
                        className={monochrome ? "text-slate-200" : ""}
                    />

                    {/* Coin Slot (Darker for depth) */}
                    <path d="M224 128H288C296.8 128 304 120.8 304 112C304 103.2 296.8 96 288 96H224C215.2 96 208 103.2 208 112C208 120.8 215.2 128 224 128Z" fill="black" fillOpacity="0.2" />

                    {/* Eye (Closed/Happy curve) */}
                    <path d="M120 220C120 220 130 210 144 220" stroke="white" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.9" />

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
