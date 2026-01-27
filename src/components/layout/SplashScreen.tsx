'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Mostrar por 2.5 segundos
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-white"
                    >
                        {/* 
                           Splash Screen requirement: 
                           "Centered icon only, brand gradient background, no text"
                           Using monochrome={true} so the logo takes the text-white color 
                           from the parent, as it's sitting on a gradient background.
                        */}
                        <Logo size={120} showText={false} monochrome={true} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
