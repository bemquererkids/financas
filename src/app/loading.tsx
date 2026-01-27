import { Logo } from "@/components/ui/Logo";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#0A0F1C] flex flex-col items-center justify-center z-[9999]">
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />

                {/* Logo Icon */}
                <div className="relative p-0.5 rounded-2xl">
                    <Logo size={80} showText={false} className="animate-pulse" />
                </div>
            </div>

            <div className="mt-8 text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tight">
                    MyWallet
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                    Sua carteira, com consciência
                </p>
            </div>

            <div className="absolute bottom-12">
                <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/50 w-full animate-[shimmer_1.5s_infinite]" />
                </div>
            </div>
        </div>
    );
}
