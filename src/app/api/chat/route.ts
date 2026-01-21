import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getFinancialSummary } from '@/app/actions/financial-actions';
import { addPlanningItem } from '@/app/actions/planning-actions';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Definição das Ferramentas (Skills)
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'add_transaction',
            description: 'Registrar uma nova transação financeira (gasto ou receita) AGORA (Histórico/Extrato Real).',
            parameters: {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Descrição do gasto presencial' },
                    amount: { type: 'number', description: 'Valor em reais (ex: 50.00)' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    category: { type: 'string', description: 'Categoria (Moradia, Lazer, etc)' },
                    date: { type: 'string', description: 'Data YYYY-MM-DD. Se for hoje, use a data atual.' }
                },
                required: ['description', 'amount', 'type', 'category']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'add_planning_item',
            description: 'Adicionar um item ao PLANEJAMENTO FUTURO (Orçamento, Previsão). Use quando o usuário falar de "mês que vem", "ano que vem", "planejar", "previsão".',
            parameters: {
                type: 'object',
                properties: {
                    month: { type: 'string', description: 'Mês do planejamento no formato YYYY-MM' },
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

        const { messages } = await req.json();

        // 1. Contexto Financeiro
        const summary = await getFinancialSummary();
        const contextData = `
      DADOS FINANCEIROS ATUAIS:
      - Saldo: R$ ${summary.balance.toFixed(2)}
      - Receitas/Mês: R$ ${summary.income.toFixed(2)}
      - Despesas/Mês: R$ ${summary.expenses.toFixed(2)}
      - Poupança: ${summary.savingsRate}%
      Data de Hoje: ${new Date().toLocaleDateString('pt-BR')}
    `;

        // 2. Chamar OpenAI
        const systemMessage = {
            role: "system",
            content: `Você é um assistente financeiro pessoal inteligente e proativo chamado 'Antigravity'.
Seu objetivo é ajudar o usuário a controlar suas finanças, analisar gastos e planejar o futuro.
Você tem permissão para gerenciar as finanças do usuário.

FERRAMENTAS DISPONÍVEIS:
1. 'add_transaction': Registra uma nova despesa ou receita. Use para "Comprei um café por 15 reais" ou "Recebi meu salário".
   - Argumentos: description (string), amount (number), type ('INCOME' | 'EXPENSE'), category (string), date (string ISO).
2. 'add_planning_item': Adiciona um item ao *Planejamento Futuro*. Use quando o usuário falar sobre o futuro, ex: "Quero planejar gastar 500 em mercado mês que vem".
   - Argumentos: month (string YYYY-MM), amount (number), description (string), type ('INCOME'|'EXPENSE'), category (string).

REGRAS:
- Seja direto e útil.
- Se o usuário pedir para registrar algo, use a ferramenta apropriada. Não pergunte "quer que eu registre?", apenas registre e confirme.
- Para categorias, tente inferir. Ex: "Sushi" -> "Alimentação".
- Sempre responda em português do Brasil 🇧🇷.
`
        };

        // 2. Primeira Chamada ao GPT (Pode retornar texto ou tool_calls)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [systemMessage, ...messages],
            tools: tools,
            tool_choice: 'auto',
        });

        const responseMessage = response.choices[0].message;

        // 3. Se houver Tool Calls (O GPT quer executar algo)
        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls;

            // Prepara array de mensagens para a segunda volta (inclui a decisão do assistente)
            const newMessages = [systemMessage, ...messages, responseMessage];

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let toolResult = "";

                try {
                    console.log(`🛠️ Executing tool: ${functionName}`, args);

                    if (functionName === 'add_transaction') {
                        // Converter date string para Date object
                        const dateObj = args.date ? new Date(args.date) : new Date();

                        await prisma.transaction.create({
                            data: {
                                description: args.description,
                                amount: args.amount,
                                type: args.type,
                                category: args.category,
                                date: dateObj,
                                userId: userId // Adicionando userId obrigatório
                            }
                        });
                        toolResult = JSON.stringify({ success: true, message: "Transação salva com sucesso no histórico." });
                    }
                    else if (functionName === 'add_planning_item') {
                        await addPlanningItem(
                            args.month,
                            args.amount,
                            args.description,
                            args.type,
                            args.category
                        );
                        toolResult = JSON.stringify({ success: true, message: `Item adicionado ao planejamento de ${args.month}.` });
                    }
                } catch (e: any) {
                    console.error("Tool execution error:", e);
                    toolResult = JSON.stringify({ success: false, error: e.message });
                }

                // Adiciona o resultado da tool à conversa
                newMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: toolResult,
                } as any);
            }

            // 4. Segunda Chamada (Gera a resposta final em texto para o usuário)
            const secondResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                stream: true,
                messages: newMessages as any,
            });

            return new StreamingTextResponse(OpenAIStream(secondResponse as any));
        }

        // Se NÃO houve tool calls (apenas conversa)
        const content = responseMessage.content || "";

        // Simplesmente reencaminha a resposta como stream (re-request as stream)
        // Isso é necessário porque StreamingTextResponse precisa de stream real.
        const streamResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [systemMessage, ...messages],
            // Sem tools aqui para garantir texto direto (embora pudesse manter, assume-se que se a primeira não chamou, a segunda igual não chamaria com temp 0.7 talvez chame, mas ok)
        });

        return new StreamingTextResponse(OpenAIStream(streamResponse as any));

    } catch (error: any) {
        console.error('❌ Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
