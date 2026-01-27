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
import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    monochrome?: boolean;
}

/**
 * Approved MyWallet Logo Component
 * Using custom assets from public folder.
 */
export function Logo({ className = "", size = 32, showText = true, monochrome = false }: LogoProps) {
    const src = monochrome ? '/logo-white.png' : '/logo.png';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <Image
                    src={src}
                    alt="MyWallet Logo"
                    fill
                    className="object-contain"
                    priority
                />
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

