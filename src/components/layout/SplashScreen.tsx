'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';
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
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <Logo size={80} showText={false} />

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"
                        >
                            MyWallet
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="mt-2 text-sm text-slate-400 tracking-wide"
                        >
                            Sua carteira, com consciência.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 200 }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="absolute bottom-20 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
