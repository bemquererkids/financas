'use client';

import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CalendarDays,
    Plus,
    ArrowRight,
    CheckCircle2,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TutorialPage() {
    return (
        <div className="flex-1 h-full md:h-[calc(100vh-2rem)] flex flex-col p-4 md:p-6 gap-6 md:gap-4 overflow-y-auto md:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section - Compact */}
            <div className="flex-shrink-0">
                <ModuleHeader
                    title="Como Usar o Sistema"
                    subtitle="Guia rápido para organizar suas finanças em 3 passos simples."
                    className="mb-2"
                />
            </div>

            {/* Main Content - 3 Column Grid for One Screen Experience */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-0">

                {/* Passo 1: O Começo */}
                <Card className="glass-card border-emerald-500/30 overflow-hidden relative group hover:border-emerald-500/50 transition-all flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <CardHeader className="pb-2 flex-shrink-0">
                        <Badge className="w-fit bg-emerald-500 hover:bg-emerald-600 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]">Passo 1</Badge>
                        <CardTitle className="text-xl text-white flex items-center gap-3">
                            <CalendarDays className="h-6 w-6 text-emerald-400" />
                            Prepare o Terreno
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                        <p className="text-slate-300 text-sm leading-relaxed flex-1">
                            Antes de tudo, o sistema precisa saber o que você <strong>já tem que pagar</strong> todo mês.
                            Cadastre suas contas fixas aqui: Aluguel, Internet, Luz, Netflix.
                        </p>
                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20">
                            <p className="text-emerald-400 text-xs">
                                💡 <strong>Dica:</strong> Defina o "Dia de Janela" (7, 15 ou 30) para agrupar pagamentos.
                            </p>
                        </div>
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-auto shadow-lg shadow-emerald-900/20">
                            <Link href="/payments">
                                Ir para Pagamentos <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Passo 2: O Dia a Dia */}
                <Card className="glass-card border-blue-500/30 overflow-hidden relative group hover:border-blue-500/50 transition-all flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <CardHeader className="pb-2 flex-shrink-0">
                        <Badge className="w-fit bg-blue-500 hover:bg-blue-600 mb-3 shadow-[0_0_10px_rgba(59,130,246,0.3)]">Passo 2</Badge>
                        <CardTitle className="text-xl text-white flex items-center gap-3">
                            <Plus className="h-6 w-6 text-blue-400" />
                            Registre o Agora
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                        <p className="text-slate-300 text-sm leading-relaxed flex-1">
                            Gastou no mercado? Recebeu um Pix? Use o <strong>Botão +</strong> (no canto da tela) para registrar na hora.
                            Isso alimenta seu saldo atual e ajuda a controlar os gastos variáveis.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 mr-1" /> Receitas</Badge>
                            <Badge variant="outline" className="text-rose-400 border-rose-500/30 bg-rose-500/10"><CheckCircle2 className="h-3 w-3 mr-1" /> Despesas</Badge>
                        </div>
                        <Button asChild variant="outline" className="w-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400 mt-auto hover:text-blue-300">
                            <Link href="/">
                                Ir para Início <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Passo 3: A Análise */}
                <Card className="glass-card border-purple-500/30 overflow-hidden relative group hover:border-purple-500/50 transition-all flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                    <CardHeader className="pb-2 flex-shrink-0">
                        <Badge className="w-fit bg-purple-500 hover:bg-purple-600 mb-3 shadow-[0_0_10px_rgba(168,85,247,0.3)]">Passo 3</Badge>
                        <CardTitle className="text-xl text-white flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-purple-400" />
                            Acompanhe o Futuro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                        <p className="text-slate-300 text-sm leading-relaxed flex-1">
                            No final, vá para a <strong>Visão Geral</strong> e clique na aba <strong>Fluxo</strong>.
                            O sistema vai juntar suas Contas Fixas (Passo 1) com suas Transações (Passo 2) e mostrar se você vai fechar o mês no verde ou no vermelho.
                        </p>
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-xs text-slate-400 italic">
                            "O segredo não é cortar cafezinho, é saber se o cafezinho cabe no orçamento."
                        </div>
                        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-auto shadow-lg shadow-purple-900/20">
                            <Link href="/?tab=fluxo">
                                Ver Fluxo Agora <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
