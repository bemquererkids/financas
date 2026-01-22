
import axios from 'axios';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Actions de Dados
import { getFinancialSummary, getRecentTransactions } from '@/app/actions/financial-actions';
import { getGoals } from '@/app/actions/goal-actions';
import { getDebts } from '@/app/actions/debt-actions';
import { getProjections } from '@/app/actions/investment-actions';
import { getPaymentWindows } from '@/app/actions/payment-actions';

// Tool Actions (Diretas)
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Lazy Initializer
let openaiInstance: OpenAI | null = null;
function getOpenAI() {
    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
        });
    }
    return openaiInstance;
}

// 🛠️ Definição das Ferramentas (Skills)
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'add_transaction',
            description: 'Registrar uma nova transação financeira AGORA (Histórico/Extrato Real).',
            parameters: {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Descrição (ex: Almoço, Uber)' },
                    amount: { type: 'number', description: 'Valor (ex: 50.00)' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    category: { type: 'string' },
                    date: { type: 'string', description: 'YYYY-MM-DD' }
                },
                required: ['description', 'amount', 'type', 'category']
            }
        }
    }
];

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        const userId = session.user.id;
        const userName = session.user.name ? session.user.name.split(' ')[0] : "Usuário";

        const { messages } = await req.json();

        // 📊 1. Coleta Massiva de Contexto (GOD MODE)
        const [
            summary,
            recentTransactions,
            goals,
            debts,
            investments,
            paymentWindows
        ] = await Promise.all([
            getFinancialSummary(),
            getRecentTransactions(),
            getGoals(),
            getDebts(),
            getProjections(),
            getPaymentWindows() // Mês atual by default
        ]);

        // --- Formatação dos Dados para o Prompt ---

        // 1. Transações
        const txList = recentTransactions.map(t =>
            `- ${new Date(t.date).toLocaleDateString('pt-BR')} | ${t.description} | R$ ${Number(t.amount).toFixed(2)} (${t.type}) | ${t.category}`
        ).join('\n');

        // 2. Objetivos
        const goalsList = goals.map(g =>
            `- [${g.status === 'COMPLETED' ? '✅ CONCLUÍDO' : '🎯 PENDENTE'}] ${g.description} ${g.targetAmount ? `(Meta: R$ ${Number(g.targetAmount).toFixed(2)})` : ''}`
        ).join('\n');

        // 3. Dívidas
        const debtsList = debts.map(d =>
            `- ${d.name}: Total R$ ${Number(d.totalValue).toFixed(2)} (Restante: R$ ${Number(d.remainingValue).toFixed(2)}) - Parcela: R$ ${Number(d.monthlyPayment).toFixed(2)}`
        ).join('\n');

        // 4. Investimentos
        const investList = investments.map(i =>
            `- ${i.name}: Saldo Inicial R$ ${Number(i.initialBalance).toFixed(2)} | Aporte R$ ${Number(i.monthlyContribution).toFixed(2)}/mês`
        ).join('\n');

        // 5. Contas a Pagar (Pagamentos)
        let paymentsList = "Nenhuma conta encontrada para este mês.";
        if (paymentWindows && paymentWindows.windows) {
            const list: string[] = [];
            Object.values(paymentWindows.windows).forEach((w: any) => {
                w.items.forEach((item: any) => {
                    list.push(`- Dia ${w.day}: ${item.name} | R$ ${item.amount.toFixed(2)} [${item.isPaid ? '🟢 PAGO' : '🔴 PENDENTE'}]`);
                });
            });
            if (list.length > 0) paymentsList = list.join('\n');
        }

        // 📊 0. Coleta do Perfil do Usuário
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                financialSituation: true,
                monthlyIncome: true,
                userProfile: true,
                mainGoal: true,
            }
        });

        // --- Montagem do Prompt do Sistema ---
        const contextData = `
DADOS DO USUÁRIO (${userName}):
- Perfil: ${user?.userProfile || 'Não definido'}
- Situação: ${user?.financialSituation || 'Não definida'}
- Renda Mensal: R$ ${user?.monthlyIncome?.toFixed(2) || '0.00'}
- Objetivo Principal: ${user?.mainGoal || 'Não definido'}

- Data Hoje: ${new Date().toLocaleDateString('pt-BR')}
- Saldo Atual: R$ ${summary.balance.toFixed(2)}
- Receitas (Mês): R$ ${summary.income.toFixed(2)}
- Despesas (Mês): R$ ${summary.expenses.toFixed(2)}

🎯 OBJETIVOS:
${goalsList.length > 0 ? goalsList : "Nenhum cadastrado."}

💸 DÍVIDAS ATIVAS:
${debtsList.length > 0 ? debtsList : "Nenhuma dívida cadastrada."}

📅 CONTAS DO MÊS (Pagamentos):
${paymentsList}

📈 INVESTIMENTOS (Projeções):
${investList.length > 0 ? investList : "Nenhum investimento cadastrado."}

📝 ÚLTIMAS TRANSAÇÕES:
${txList.length > 0 ? txList : "Nenhuma transação recente."}
`;

        const systemMessage = {
            role: "system",
            content: `Você é o 'Agente Financeiro', um parceiro de organização financeira de ${userName}.
Seu objetivo é trazer tranquilidade e clareza. Use um tom **colaborativo, leve e organizado** ("Vamos resolver tudo", "Um passo de cada vez").

CONTEXTO DO ONBOARDING:
O usuário tem o perfil: **${user?.userProfile || 'Não definido'}**.
Objetivo principal: **${user?.mainGoal || 'Não definido'}**.
Renda informada (Base): **R$ ${user?.monthlyIncome?.toFixed(2) || 'Não informada'}**.

DIRETRIZES DE RESPOSTA:
1. **Comece pelo Positivo**: Se o usuário não tem dados, use a renda informada como ponto de partida. ex: "Vi que sua renda é de R$ ${user?.monthlyIncome}. Que tal começarmos registrando seus gastos fixos?"
2. **Seja Organizado, não Crítico**: Se tiver dívidas, diga: "Vamos organizar isso. O segredo é listar tudo para traçarmos um plano."
3. **Sem Pressão**: Evite termos alarmistas. Use "Oportunidade de melhoria", "Ajuste necessário", "Planejamento".
4. **Respostas Curtas e Práticas**: Dê *um* próximo passo claro por vez.

---
${contextData}
---

REGRAS TÉCNICAS:
- Responda sempre em Português do Brasil.
- Não invente valores que não estão no contexto.
- Se o usuário pedir para adicionar algo, use as tools disponíveis.
`
        };

        // 3. Primeira Chamada ao LLM
        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            temperature: 0.2, // Baixa criatividade para precisão
            messages: [systemMessage, ...messages],
            tools: tools,
            tool_choice: 'auto',
        });

        const responseMessage = response.choices[0].message;

        // 4. Verificar se houve chamada de Tool
        if (responseMessage.tool_calls) {
            const newMessages = [systemMessage, ...messages, responseMessage];

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                let functionResult = "";

                if (functionName === 'add_transaction') {
                    // Executar no Banco Real
                    const transaction = await prisma.transaction.create({
                        data: {
                            userId,
                            description: functionArgs.description,
                            amount: Number(functionArgs.amount),
                            type: functionArgs.type,
                            category: functionArgs.category,
                            date: new Date(functionArgs.date || new Date()),
                            isRecurring: false
                        } as any
                    });
                    functionResult = JSON.stringify({ success: true, id: transaction.id, message: "Transação registrada!" });
                }

                newMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResult,
                });
            }

            // 5. Segunda Chamada (Resposta Final)
            const secondResponse = await getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                temperature: 0.2,
                stream: true,
                messages: newMessages as any,
            });

            return new StreamingTextResponse(OpenAIStream(secondResponse as any));
        }

        // Sem tools -> Stream direto
        const streamResponse = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.2,
            stream: true,
            messages: [systemMessage, ...messages],
        });

        return new StreamingTextResponse(OpenAIStream(streamResponse as any));

    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response('Error processing chat request', { status: 500 });
    }
}
