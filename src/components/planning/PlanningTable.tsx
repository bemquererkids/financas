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
                <table className="w-full text-sm text-left">
                    <thead className="text-slate-400 font-medium bg-slate-950/30">
                        <tr>
                            <th className="px-4 py-3">Mês</th>
                            <th className="px-4 py-3 text-right">Entradas Previstas</th>
                            <th className="px-4 py-3 text-right">Saídas Previstas</th>
                            <th className="px-4 py-3 text-right">Resultado do Mês</th>
                            <th className="px-4 py-3 text-right">Acumulado Projetado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.map((row, index) => {
                            const receita = row.receita || 0;
                            const despesa = row.despesa || 0;
                            const resultadoMes = receita - despesa;

                            return (
                                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-200">
                                        {row.month} {row.year ? <span className="text-slate-500 text-xs">/{row.year}</span> : ''}
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        <div className={`flex items-center justify-end gap-1 ${resultadoMes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {resultadoMes > 0 ? <ArrowUpIcon className="w-3 h-3" /> : resultadoMes < 0 ? <ArrowDownIcon className="w-3 h-3" /> : <MinusIcon className="w-3 h-3" />}
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(resultadoMes))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-white">
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
