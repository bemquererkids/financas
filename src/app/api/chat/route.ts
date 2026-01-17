import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getFinancialSummary } from '@/app/actions/financial-actions';

// Ensure module is treated as dynamic
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        console.log("🤖 Chat API Called");

        // Check API Key
        if (!process.env.OPENAI_API_KEY) {
            console.error("❌ OPENAI_API_KEY is missing");
            return new Response(JSON.stringify({ error: 'Configuração de API Key ausente' }), { status: 500 });
        }

        const { messages } = await req.json();
        console.log(`📩 Received ${messages.length} messages`);

        // 1. Retrieve Financial Data
        console.log("📊 Fetching financial summary...");
        const summary = await getFinancialSummary();
        console.log("✅ Financial summary retrieved:", JSON.stringify({
            balance: summary.balance,
            health: summary.healthScore
        }));

        // 2. Create Context String (Correcting property access)
        // summary.rule503020 contains the nested objects needs, wants, savings
        const contextData = `
      DADOS FINANCEIROS ATUAIS DO USUÁRIO:
      - Saldo Atual: R$ ${summary.balance.toFixed(2)}
      - Receitas do Mês: R$ ${summary.income.toFixed(2)}
      - Despesas do Mês: R$ ${summary.expenses.toFixed(2)}
      - Taxa de Poupança: ${summary.savingsRate}%
      
      Regra 50/30/20:
      - Necessidades (50%): Gastou R$ ${summary.rule503020.needs.spent.toFixed(2)} (Meta: R$ ${summary.rule503020.needs.target.toFixed(2)})
      - Desejos (30%): Gastou R$ ${summary.rule503020.wants.spent.toFixed(2)} (Meta: R$ ${summary.rule503020.wants.target.toFixed(2)})
      - Poupança/Dívidas (20%): Gastou R$ ${summary.rule503020.savings.spent.toFixed(2)} (Meta: R$ ${summary.rule503020.savings.target.toFixed(2)})
    `;

        // 3. System Prompt
        const systemMessage = {
            role: 'system',
            content: `Você é um Consultor Financeiro Pessoal experiente, ético e conservador.
      
      CONTEXTO DO USUÁRIO:
      ${contextData}

      DIRETRIZES:
      1. Use os dados acima para responder às perguntas. Se o usuário perguntar "posso gastar?", verifique o saldo e os envelopes (Regra 50/30/20).
      2. Seja direto e prático. Evite "palestras" longas.
      3. Nunca invente dados. Se não souber, diga que não tem essa informação no resumo.
      4. Responda sempre em Português do Brasil, de forma amigável.
      5. Se o usuário perguntar sobre algo não financeiro (ex: política, futebol), diga educadamente que só pode ajudar com finanças.`
        };

        console.log("🧠 Sending request to OpenAI...");

        // 4. Call OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [systemMessage, ...messages],
            temperature: 0.7,
        });

        console.log("🌊 Stream started");

        // 5. Stream Response
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);

    } catch (error: any) {
        console.error('❌ Chat API Error:', error);
        // Return the error message to the client for visible debugging
        return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), { status: 500 });
    }
}
