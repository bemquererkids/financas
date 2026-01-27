import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    monochrome?: boolean;
}

/**
 * Approved MyWallet Logo Component
 * Concept: Secure internal value (coin) within a stable wallet container.
 * Visuals: Minimalist, geometric, financial semantics first.
 */
export function Logo({ className = "", size = 32, showText = true, monochrome = false }: LogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                <defs>
                    <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" /> {/* Emerald-500 */}
                        <stop offset="100%" stopColor="#059669" /> {/* Emerald-600 */}
                    </linearGradient>
                </defs>

                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.211 17.859 10.016C17.95 9.692 18 9.352 18 9C18 7.34315 16.6569 6 15 6H11C10.0123 6 9.15112 6.47775 8.6182 7.2185C7.94025 7.07844 7.23432 7 6.5 7C3.46243 7 1 9.46243 1 12.5C1 14.9818 2.65886 17.0851 4.94528 17.7554C5.03541 18.4619 5.63529 19 6.36364 19H8.18182C9.09848 19 9.87326 18.3396 10 17.4649V17.5C10 18.3284 10.6716 19 11.5 19H12.5C13.3284 19 14 18.3284 14 17.5V17.4649C14.1267 18.3396 14.9015 19 15.8182 19H17.5ZM13 11H9C8.44772 11 8 10.5523 8 10C8 9.44772 8.44772 9 9 9H13C13.5523 9 14 9.44772 14 10C14 10.5523 13.5523 11 13 11Z"
                    fill={monochrome ? "currentColor" : "url(#logo_gradient)"}
                />
            </svg>

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
