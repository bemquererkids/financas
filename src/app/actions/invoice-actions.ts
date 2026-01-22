'use server';

import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addPayable } from './payment-actions';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Nova versão: Recebe o TEXTO já extraído no frontend.
 * Isso elimina a dependência de parsing de PDF no servidor (que causa erro 500 no Railway).
 */
export async function extractFinancialData(text: string) {
    console.log('Started extractFinancialData (Server Action)');
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('Missing OPENAI_API_KEY');
            return { error: 'Configuração de IA ausente no servidor.' };
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { error: 'Unauthorized' };

        if (!text || text.length < 5) {
            return { error: 'Texto do documento vazio ou muito curto.' };
        }

        console.log(`Processing text length: ${text.length} chars`);

        // Usar LLM para analisar e classificar
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `Você é uma IA especialista em contabilidade pessoal.
                    Analise o texto do documento financeiro e extraia os dados para o MyWallet.
                    
                    PRIMEIRO, CLASSIFIQUE O TIPO:
                    - "PAYABLE": Se for uma Fatura de Cartão (fechada), Boleto de Conta (Luz, Água, Internet), ou qualquer cobrança.
                    - "TRANSACTION": Se for um comprovante de pagamento JÁ efetuado.

                    ATENÇÃO CRÍTICA PARA FATURAS DE CARTÃO (ex: Itaú, Nubank):
                    - Valor: Procure por "Total desta fatura", "Valor da Fatura" ou "Total a pagar". Ignore "Pagamento mínimo" ou "Lançamentos atuais" se houver um Total consolidado.
                    - Data: Procure por "Vencimento", "Vence em". EXTRAIA A DATA EXATA QUE ESTÁ NO PAPEL (ex: 26/12/2025). NÃO use a data de hoje. Se estiver vencida, mantenha a data original vencida.
                    - Descrição: Use "Fatura [Nome do Banco]" (ex: "Fatura Itaú", "Fatura Nubank").

                    EM SEGUIDA, EXTRAIA:
                    1. Descrição Sugerida.
                    2. Valor TOTAL (number).
                    3. Data Relevante (YYYY-MM-DD).
                    4. Categoria Sugerida (Ex: "Cartão de Crédito" para faturas, "Moradia" para luz).

                    Retorne APENAS um JSON válido:
                    {
                        "type": "PAYABLE" | "TRANSACTION",
                        "description": "string",
                        "amount": number,
                        "date": "YYYY-MM-DD",
                        "category": "string"
                    }
                    Se não encontrar algum campo, tente inferir pelo contexto, mas priorize a exatidão dos números.`
                },
                {
                    role: "user",
                    content: `Texto do Documento (Início):\n${text.slice(0, 4000)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('Empty response from OpenAI');

        const data = JSON.parse(content);
        console.log('OpenAI analysis success:', data);

        return { success: true, data };

    } catch (error: any) {
        console.error('CRITICAL ERROR in extractFinancialData:', error);
        return { error: `Erro ao processar: ${error.message || 'Erro interno'}.` };
    }
}

// Wrapper legado apenas para não quebrar imports se houver, mas idealmente não usado mais
export async function extractInvoiceData(formData: FormData) {
    return { error: 'Função obsoleta. Use o extrator no navegador.' };
}

export async function createInvoicePayable(formData: FormData) {
    return await addPayable(formData);
}
