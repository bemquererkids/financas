import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getFinancialSummary, getRecentTransactions } from '@/app/actions/financial-actions';
import { addPlanningItem } from '@/app/actions/planning-actions';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Lazy initialization
let openaiInstance: OpenAI | null = null;
function getOpenAI() {
    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
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
    },
    {
        type: 'function',
        function: {
            name: 'add_planning_item',
            description: 'Adicionar item ao PLANEJAMENTO FUTURO (Orçamento/Meta).',
            parameters: {
                type: 'object',
                properties: {
                    month: { type: 'string', description: 'YYYY-MM' },
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    category: { type: 'string' }
                },
                required: ['month', 'description', 'amount', 'type', 'category']
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
        const userName = session.user.name ? session.user.name.split(' ')[0] : "Usuário"; // Primeiro nome

        const { messages } = await req.json();

        // 📊 1. Coletar Contexto Financeiro Real
        const summary = await getFinancialSummary();
        const recentTransactions = await getRecentTransactions(); // Pega as últimas transações reais

        // Formatar transações para o prompt
        const txList = recentTransactions.map(t =>
            `- ${new Date(t.date).toLocaleDateString('pt-BR')} | ${t.description} | R$ ${Number(t.amount).toFixed(2)} (${t.type}) | ${t.category}`
        ).join('\n');

        const contextData = `
DADOS DO USUÁRIO (${userName}):
- Data Hoje: ${new Date().toLocaleDateString('pt-BR')}
- Saldo Atual: R$ ${summary.balance.toFixed(2)}
- Receitas (Mês): R$ ${summary.income.toFixed(2)}
- Despesas (Mês): R$ ${summary.expenses.toFixed(2)}

ÚLTIMAS TRANSAÇÕES REGISTRADAS:
${txList.length > 0 ? txList : "Nenhuma transação recente."}
`;

        // 🤖 2. Configurar System Message com Contexto Injetado
        const systemMessage = {
            role: "system",
            content: `Você é o 'Agente Financeiro', um consultor pessoal experiente e ponderado de ${userName}.
Seu papel é ORIENTAR e dar clareza sobre a vida financeira do usuário, baseando-se estritamente nos dados reais.

CRÍTICO:
- Você TEM acesso aos dados abaixo.
- Aja como um mentor: explique o que os números significam, não apenas jogue valores.
- NÃO tome decisões pelo usuário, apenas execute comandos se for explicitamente solicitado (ex: "registre isso").
- Se não tiver certeza ou os dados não existirem, diga "Não tenho essa informação". NÃO TENTE ADIVINHAR.

---
${contextData}
---

REGRAS:
1. Responda de forma cordial e profissional.
2. Use os dados acima para responder perguntas. Se não estiver na lista, DIGA QUE NÃO SABE.
3. Use tools apenas quando solicitado claramente.
4. Responda sempre em Português do Brasil.
`
        };

        // 3. Primeira Chamada ao LLM (Upgrade para GPT-4o para evitar alucinações de tools)
        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            temperature: 0.2, // Baixa criatividade para garantir precisão factual
            messages: [systemMessage, ...messages],
            tools: tools,
            tool_choice: 'auto',
        });

        const responseMessage = response.choices[0].message;

        // 4. Executar Tool Calls se houver
        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls;
            const newMessages = [systemMessage, ...messages, responseMessage];

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let toolResult = "";

                try {
                    if (functionName === 'add_transaction') {
                        const dateObj = args.date ? new Date(args.date) : new Date();
                        await prisma.transaction.create({
                            data: {
                                userId: userId,
                                description: args.description,
                                amount: args.amount,
                                type: args.type,
                                category: args.category,
                                date: dateObj,
                            } as any
                        });
                        toolResult = JSON.stringify({ success: true, message: `Transação '${args.description}' registrada com sucesso.` });
                    }
                    else if (functionName === 'add_planning_item') {
                        await addPlanningItem(
                            args.month,
                            args.amount,
                            args.description,
                            args.type,
                            args.category
                        );
                        toolResult = JSON.stringify({ success: true, message: `Adicionado ao planejamento de ${args.month}.` });
                    }
                } catch (e: any) {
                    toolResult = JSON.stringify({ success: false, error: e.message });
                }

                newMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: toolResult,
                } as any);
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

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
