import { Construction } from "lucide-react";

export default function PlaceholderModulePage({ params }: { params: { slug: string } }) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-6">
            <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-4">
                <Construction className="h-16 w-16 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white">Módulo em Construção</h2>
            <p className="text-slate-400 max-w-md mx-auto">
                Estamos implementando as funcionalidades deste módulo conforme o Documento Técnico RNV.
                <br />
                <span className="text-indigo-500 font-mono mt-2 block">Status: Working on it...</span>
            </p>
        </div>
    );
}
