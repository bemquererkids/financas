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
            balance: summary.balance
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
      - Necessidades (50%): Gastou R$ ${(summary.rule503020.needs.actual || 0).toFixed(2)} (Meta: R$ ${(summary.rule503020.needs.target || 0).toFixed(2)})
      - Desejos (30%): Gastou R$ ${(summary.rule503020.wants.actual || 0).toFixed(2)} (Meta: R$ ${(summary.rule503020.wants.target || 0).toFixed(2)})
      - Poupança/Dívidas (20%): Gastou R$ ${(summary.rule503020.savings.actual || 0).toFixed(2)} (Meta: R$ ${(summary.rule503020.savings.target || 0).toFixed(2)})
    `;

        // 3. System Prompt
        const systemMessage = {
            role: 'system',
            content: `Você é um Consultor Financeiro Pessoal experiente, ético e conservador.
      
      CONTEXTO DO USUÁRIO:
      ${contextData}

      DIRETRIZES DE RESPOSTA:
      1. **Formatação**: Use Markdown. Negrito em valores (ex: **R$ 100,00**) e tópicos para organizar.
      2. **Estrutura**:
         - Comece com uma resposta direta à pergunta.
         - Se necessário, mostre os dados que embasam sua resposta (Saldo, Envelope).
         - Termine com um conselho prático.
      3. **Regra 50/30/20**: Sempre que falar de gastos, compare com a meta da categoria (Necessidades/Desejos/Poupança).
      4. **Tom**: Profissional, mas acessível. Sem "palestras" longas.
      5. **Segurança**: Nunca invente dados. Se a informação não estiver no contexto, diga que não sabe.
      6. **Escopo**: Responda apenas sobre finanças.`
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
        return new StreamingTextResponse(stream as any);

    } catch (error: any) {
        console.error('❌ Chat API Error:', error);
        // Return the error message to the client for visible debugging
        return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), { status: 500 });
    }
}
