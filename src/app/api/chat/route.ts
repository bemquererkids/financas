
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getFinancialSummary } from '@/app/actions/financial-actions';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Schema para entender a intenção do usuário
const IntentSchema = z.object({
    intent: z.enum(['TRANSACTION', 'PAYABLE', 'CHAT']).describe('Intenção do usuário: registrar gasto, agendar conta ou apenas conversar'),
    transaction: z.object({
        description: z.string().describe('Descrição do gasto'),
        amount: z.number().describe('Valor do gasto'),
        type: z.enum(['INCOME', 'EXPENSE']).describe('Tipo de transação'),
        category: z.string().describe('Categoria: FOOD, TRANSPORT, HOUSING, etc.'),
        date: z.string().describe('Data YYYY-MM-DD')
    }).nullable().describe('Dados caso seja um gasto/receita'),
    payable: z.object({
        name: z.string().describe('Nome da conta'),
        amount: z.number().describe('Valor a pagar'),
        dueDate: z.string().describe('Data de vencimento YYYY-MM-DD')
    }).nullable().describe('Dados caso seja agendamento de conta'),
    chatMessage: z.string().nullable().describe('Sua RESPOSTA para o usuário. Se for uma pergunta, responda de forma útil e consultiva.')
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const userId = session.user.id;
        const userName = session.user.name?.split(' ')[0] || "Usuário";
        const todayStr = new Date().toLocaleDateString('pt-BR');

        const { messages, context = 'general' } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // Obter contexto COMPLETO
        let contextData = null;
        let summaryText = "";
        try {
            const { getFullFinancialContext } = await import('@/app/actions/financial-actions');
            contextData = await getFullFinancialContext();

            summaryText = `
RESUMO FINANCEIRO:
- Saldo Atual: R$ ${contextData.summary.balance.toFixed(2)}
- Gastos no Mês: R$ ${contextData.summary.expenses.toFixed(2)}
- Receitas: R$ ${contextData.summary.income.toFixed(2)}
- Disponível (Livre): R$ ${contextData.summary.fundsAvailable.toFixed(2)}

OBJETIVOS ATUAIS:
${contextData.goals.map(g => `- ${g.description}: Alvo R$ ${g.targetAmount}`).join('\n') || "Nenhum objetivo cadastrado."}

DÍVIDAS EM ABERTO:
${contextData.debts.map(d => `- ${d.name}: Resta R$ ${d.remainingValue} (Parcela R$ ${d.monthlyPayment})`).join('\n') || "Nenhuma dívida cadastrada."}

PRÓXIMAS CONTAS (5 dias):
${contextData.upcomingBills.map(b => `- ${b.name}: R$ ${b.amount} (Vence: ${new Date(b.dueDate).toLocaleDateString()})`).join('\n') || "Nenhuma conta próxima."}

ÚLTIMAS TRANSAÇÕES:
${contextData.lastTransactions.map(t => `- ${t.description} (${t.category}): R$ ${t.amount} em ${new Date(t.date).toLocaleDateString()}`).join('\n')}
`;
        } catch (e) {
            console.error("Erro ao carregar contexto financeiro", e);
            summaryText = "Resumo financeiro indisponível no momento.";
        }

        // --- CONTEXTO EXPERT ---
        let specializedPrompt = "";
        let expertRole = "Planejador Financeiro Sênior (CFP®)";

        switch (context) {
            case 'goals':
                expertRole = "Estrategista de Metas Financeiras";
                specializedPrompt = `
FOCO: Ajudar o usuário a definir e alcançar objetivos.
- Se o usuário perguntar "como definir metas", sugira o método SMART.
- Se falar de um sonho (ex: casa própria), ajude a calcular quanto guardar por mês.
- Use os dados de 'OBJETIVOS ATUAIS' e 'SALDO' para dar conselhos realistas.
`;
                break;
            case 'investments':
                expertRole = "Consultor de Investimentos (CGA)";
                specializedPrompt = `
FOCO: Educação financeira e estratégia de investimentos.
- Explique conceitos (CDB, FIIs, Ações) de forma simples se perguntado.
- Se o usuário perguntar "onde investir", analise o perfil (conservador/arrojado) baseado no histórico (se houver) ou pergunte.
- NÃO dê recomendação de compra específica de ativo (ex: "Compre PETR4 agora"), mas sim de classes (ex: "Ações de commodities").
- Lembre sempre da Reserva de Emergência antes de investir.
`;
                break;
            case 'payments':
                expertRole = "Organizador Financeiro e Concierge";
                specializedPrompt = `
FOCO: Gestão de fluxo de caixa e contas a pagar.
- Ajude a organizar vencimentos.
- Se houver pouco saldo, priorize contas essenciais (Luz, Água, Aluguel).
- Sugira janelas de pagamento (dia 7, 15, 30).
`;
                break;
            default:
                specializedPrompt = "FOCO: Visão holística das finanças, saúde financeira e bons hábitos.";
                break;
        }

        const systemPrompt = `Você é o Agente Financeiro MyWallet, atuando como ${expertRole}.
Hoje é dia ${todayStr}.

${summaryText}

SUA MISSÃO:
Atuar de forma proativa, segura e hiper-personalizada.
${specializedPrompt}

GUARDRAILS DE SEGURANÇA (SIGA RIGOROSAMENTE):
1. **Prioridade de Sobrevivência**: Se saldo <= 0, foco total em cortar gastos.
2. **Contas Vencendo**: Alerte sobre contas próximas.
3. **Reserva de Emergência**: Prioridade #1 antes de investimentos arriscados.
4. **Tom de Voz**: Premium, direto, empático. Use bullets para listas.

INTENÇÕES:
- TRANSACTION: Registrar gasto/ganho.
- PAYABLE: Agendar conta.
- CHAT: Consultoria.`;

        // 1. ANÁLISE DE INTENÇÃO (Structured)
        try {
            const { object: analysis } = await generateObject({
                model: google('gemini-2.0-flash'),
                schema: IntentSchema,
                system: systemPrompt,
                prompt: `Mensagem atual (${context}): "${lastMessage}"`
            });

            let finalResponse = analysis.chatMessage || "Entendido.";

            // 2. EXECUÇÃO DA AÇÃO
            if (analysis.intent === 'TRANSACTION' && analysis.transaction) {
                await prisma.transaction.create({
                    data: {
                        userId,
                        description: analysis.transaction.description,
                        amount: Math.abs(analysis.transaction.amount),
                        type: analysis.transaction.type,
                        category: analysis.transaction.category?.toUpperCase() || 'OTHER',
                        date: new Date(analysis.transaction.date),
                    }
                });
                revalidatePath('/');
                finalResponse = `✅ Gasto registrado: ${analysis.transaction.description} - R$ ${analysis.transaction.amount.toFixed(2)}`;
            }
            else if (analysis.intent === 'PAYABLE' && analysis.payable) {
                const date = new Date(analysis.payable.dueDate);
                const monthStr = date.toISOString().slice(0, 7);
                const windowDay = date.getDate() <= 7 ? 7 : date.getDate() <= 15 ? 15 : 30;

                let window = await prisma.paymentWindow.findFirst({
                    where: { month: monthStr, windowDay, userId }
                });

                if (!window) {
                    window = await prisma.paymentWindow.create({
                        data: { month: monthStr, windowDay, receivedAmount: 0, userId }
                    });
                }

                await prisma.payable.create({
                    data: {
                        name: analysis.payable.name,
                        amount: analysis.payable.amount,
                        dueDate: date,
                        paymentWindowId: window.id
                    }
                });
                revalidatePath('/payments');
                finalResponse = `✅ Conta agendada: ${analysis.payable.name} - R$ ${analysis.payable.amount.toFixed(2)} para ${analysis.payable.dueDate}`;
            }

            return new Response(JSON.stringify({ content: finalResponse }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (innerError: any) {
            const logPath = path.join(process.cwd(), 'chat_error.log');
            fs.appendFileSync(logPath, `${new Date().toISOString()} - Intent Error: ${innerError.message}\n`);

            // Fallback: Se falhar a estrutura, tente apenas conversar
            try {
                const { text } = await generateText({
                    model: google('gemini-2.0-flash'),
                    system: systemPrompt,
                    prompt: lastMessage
                });
                return new Response(JSON.stringify({ content: text }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (fallbackError) {
                return new Response(JSON.stringify({ content: "Desculpe, estou com dificuldades para processar sua solicitação no momento. Tente reformular." }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: `Erro: ${error.message}` }), { status: 500 });
    }
}
