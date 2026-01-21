'use client';

import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CalendarDays,
    Plus,
    LayoutDashboard,
    ArrowRight,
    CheckCircle2,
    Wallet,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function TutorialPage() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ModuleHeader
                title="Como Usar o Sistema"
                subtitle="Guia rápido para organizar suas finanças em 3 passos simples."
            />

            <div className="grid gap-8 max-w-5xl mx-auto">

                {/* Passo 1: O Começo */}
                <div className="relative pl-8 md:pl-0">
                    <div className="hidden md:absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-emerald-500/20 to-transparent -ml-8 md:ml-0 md:left-[50%] md:-translate-x-[50%]"></div>

                    <Card className="glass-card border-emerald-500/30 overflow-hidden relative group hover:border-emerald-500/40 transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <CardHeader className="pb-2">
                            <Badge className="w-fit bg-emerald-500 hover:bg-emerald-600 mb-2">Passo 1</Badge>
                            <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-3">
                                <CalendarDays className="h-6 w-6 text-emerald-400" />
                                Prepare o Terreno (Pagamentos)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                Antes de tudo, o sistema precisa saber o que você <strong>já tem que pagar</strong> todo mês.
                                Cadastre suas contas fixas aqui: Aluguel, Internet, Luz, Netflix.
                            </p>
                            <p className="text-slate-400 text-sm">
                                💡 <strong>Dica:</strong> Defina o "Dia de Janela" (7, 15 ou 30) para agrupar pagamentos por quinzena.
                            </p>
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                                <Link href="/payments">
                                    Ir para Pagamentos <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Passo 2: O Dia a Dia */}
                <div className="relative pl-8 md:pl-0">
                    <div className="hidden md:absolute left-[50%] -translate-x-[50%] top-[-2rem] bottom-[-2rem] w-px bg-white/5"></div>

                    <Card className="glass-card border-blue-500/30 overflow-hidden relative group hover:border-blue-500/40 transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <CardHeader className="pb-2">
                            <Badge className="w-fit bg-blue-500 hover:bg-blue-600 mb-2">Passo 2</Badge>
                            <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-3">
                                <Plus className="h-6 w-6 text-blue-400" />
                                Registre o Agora (Transações)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                Gastou no mercado? Recebeu um Pix? Use o <strong>Botão +</strong> (no canto da tela) para registrar na hora.
                                Isso alimenta seu saldo atual e ajuda a controlar os gastos variáveis.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 mr-1" /> Receitas</Badge>
                                <Badge variant="outline" className="text-rose-400 border-rose-500/30 bg-rose-500/10"><CheckCircle2 className="h-3 w-3 mr-1" /> Despesas</Badge>
                            </div>
                            <Button asChild variant="outline" className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400 mt-2">
                                <Link href="/">
                                    Ir para Início <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Passo 3: A Análise */}
                <div className="relative pl-8 md:pl-0">
                    <Card className="glass-card border-purple-500/30 overflow-hidden relative group hover:border-purple-500/40 transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                        <CardHeader className="pb-2">
                            <Badge className="w-fit bg-purple-500 hover:bg-purple-600 mb-2">Passo 3</Badge>
                            <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-purple-400" />
                                Acompanhe o Futuro (Fluxo)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                No final, vá para a <strong>Visão Geral</strong> e clique na aba <strong>Fluxo</strong>.
                                O sistema vai juntar suas Contas Fixas (Passo 1) com suas Transações (Passo 2) e mostrar se você vai fechar o mês no verde ou no vermelho.
                            </p>
                            <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-sm text-slate-400 italic">
                                "O segredo não é cortar cafezinho, é saber se o cafezinho cabe no orçamento."
                            </div>
                            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white mt-2">
                                <Link href="/">
                                    Ver Fluxo Agora <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
