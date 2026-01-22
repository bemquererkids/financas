import { Wallet } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#0A0F1C] flex flex-col items-center justify-center z-[9999]">
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />

                {/* Logo Icon */}
                <div className="relative bg-gradient-to-br from-emerald-400 to-cyan-400 p-0.5 rounded-2xl shadow-2xl shadow-emerald-500/20">
                    <div className="bg-[#0A0F1C] p-4 rounded-[14px]">
                        <Wallet className="h-12 w-12 text-emerald-400 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent tracking-tight">
                    MyWallet
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                    Sua carteira, com consciência
                </p>
            </div>

            <div className="absolute bottom-12">
                <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50 w-full animate-[shimmer_1.5s_infinite]" />
                </div>
            </div>
        </div>
    );
}
