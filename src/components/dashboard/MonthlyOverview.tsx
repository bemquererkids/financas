import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { getMonthlyAnalysis, MonthResult } from "@/app/actions/analysis-actions";

export async function MonthlyOverview() {
    const data = await getMonthlyAnalysis();

    // Extrair todas as categorias únicas encontradas
    const allCategories = new Set<string>();
    data.forEach(d => Object.keys(d.categories).forEach(c => allCategories.add(c)));
    const categoriesList = Array.from(allCategories).sort();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (!data.length) {
        return (
            <div className="p-8 text-center text-slate-400 glass-card rounded-3xl">
                <p>Nenhum dado lançado ainda. Adicione transações para ver a análise mês a mês.</p>
            </div>
        )
    }

    return (
        <div className="rounded-3xl glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
                <h3 className="text-xl font-bold text-white">Análise Mês a Mês</h3>
                <p className="text-sm text-slate-400">Detalhamento completo de custos.</p>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="w-[200px] text-white font-bold">Categoria</TableHead>
                            {data.map((monthData) => (
                                <TableHead key={monthData.month} className="text-center text-slate-200 capitalize min-w-[120px]">
                                    {monthData.month.split('/')[0]} <span className="text-xs text-slate-500 block">{monthData.month.split('/')[1]}</span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Linhas de Categorias de Despesas */}
                        {categoriesList.map(category => (
                            <TableRow key={category} className="hover:bg-white/5 border-white/5">
                                <TableCell className="font-medium text-slate-300">{category}</TableCell>
                                {data.map(month => (
                                    <TableCell key={month.month} className="text-center text-slate-400">
                                        {month.categories[category] ? formatCurrency(month.categories[category]) : '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        <TableRow className="bg-white/5 border-t-2 border-white/10">
                            <TableCell className="font-bold text-white">TOTAL CUSTOS</TableCell>
                            {data.map(month => (
                                <TableCell key={month.month} className="text-center font-bold text-rose-400">
                                    {formatCurrency(month.totalExpense)}
                                </TableCell>
                            ))}
                        </TableRow>

                        <TableRow className="bg-emerald-950/20 border-white/5">
                            <TableCell className="font-bold text-white">SOBRA / FALTA</TableCell>
                            {data.map(month => {
                                const balance = month.totalIncome - month.totalExpense;
                                return (
                                    <TableCell key={month.month} className={`text-center font-bold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                        {formatCurrency(balance)}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
