
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

        const { messages } = await req.json();
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

        // 1. ANÁLISE DE INTENÇÃO (Usando o modelo que sabemos que funciona)
        try {
            const { object: analysis } = await generateObject({
                model: google('gemini-2.0-flash'),
                schema: IntentSchema,
                system: `Você é o Agente Financeiro MyWallet, um Planejador Financeiro Sênior (CFP®).
Hoje é dia ${todayStr}.

${summaryText}

SUA MISSÃO:
Atuar como um consultor financeiro proativo, seguro e hiper-personalizado.
Não dê respostas genéricas. Use os números do usuário.

GUARDRAILS DE SEGURANÇA (SIGA RIGOROSAMENTE):
1. **Prioridade de Sobrevivência**: Se o usuário tiver saldo negativo ou zero, ignore objetivos de longo prazo e foque em: (1) Reduzir gastos, (2) Renegociar dívidas.
2. **Contas Vencendo**: Se houver contas próximas (${contextData?.upcomingBills.length || 0}), alerte o usuário antes de sugerir novos gastos.
3. **Reserva de Emergência**: Se o usuário não tiver uma, sugira começar com R$ 500,00 antes de investir em viagens ou bens de consumo.
4. **Dívidas**: Se houver dívidas com juros altos, sugira o método "Avalanche" (pagar a de maior juros primeiro).
5. **Realismo**: Se o usuário quer juntar R$ 10k em 1 mês ganhando R$ 2k, diga que é impossível e proponha um plano viável.

INTENÇÕES:
- TRANSACTION: Registrar gasto/ganho recebido.
- PAYABLE: Agendar conta futura.
- CHAT: Consultoria financeira baseada nos dados acima. Responda com planos práticos, passo-a-passo.

REGRAS PARA 'chatMessage':
- Seja direto e empático.
- Use emojis moderadamente.
- Se for dar uma dica, use bullets.
- CITE VALORES. Ex: "Com seu saldo de R$ X, sugiro..."`,
                prompt: `Mensagem atual do usuário: "${lastMessage}"`
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

            // Fallback simples se o structured output falhar
            return new Response(JSON.stringify({ content: "Não entendi, pode repetir de forma mais clara?" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: `Erro: ${error.message}` }), { status: 500 });
    }
}
