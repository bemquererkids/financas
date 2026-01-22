import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

interface ProjectionPoint {
    month: string;
    year?: number;
    saldo: number;
    receita?: number;
    despesa?: number;
}

interface PlanningTableProps {
    data: ProjectionPoint[];
}

export function PlanningTable({ data }: PlanningTableProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">Detalhamento Mensal</h3>
                <p className="text-slate-400 text-sm">Visão mês a mês das suas entradas, saídas e saldo acumulado.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-slate-400 font-medium bg-slate-950/50 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Mês</th>
                            <th className="px-6 py-4 text-right font-semibold">Entradas</th>
                            <th className="px-6 py-4 text-right font-semibold">Saídas</th>
                            <th className="px-6 py-4 text-right font-semibold">Resultado</th>
                            <th className="px-6 py-4 text-right font-semibold text-emerald-400">Acumulado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.map((row, index) => {
                            const receita = row.receita || 0;
                            const despesa = row.despesa || 0;
                            const resultadoMes = receita - despesa;

                            return (
                                <tr key={index} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
                                            {row.month} {row.year ? <span className="text-slate-500 text-xs font-normal">/{row.year}</span> : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-emerald-400/90 font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-400/90 font-mono">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">
                                        <div className={`flex items-center justify-end gap-1.5 ${resultadoMes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(resultadoMes))}
                                            {resultadoMes > 0 ? <ArrowUpIcon className="w-3 h-3 opacity-60" /> : resultadoMes < 0 ? <ArrowDownIcon className="w-3 h-3 opacity-60" /> : <MinusIcon className="w-3 h-3 opacity-60" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-white font-mono bg-slate-800/20 group-hover:bg-slate-800/40 transition-colors rounded-r-lg">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.saldo)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
