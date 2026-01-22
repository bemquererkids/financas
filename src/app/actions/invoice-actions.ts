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
                    - "PAYABLE": Se for uma Fatura de Cartão, Boleto de Conta (Luz, Água, Internet), ou qualquer cobrança com Vencimento Futuro.
                    - "TRANSACTION": Se for um Recibo, Nota Fiscal, Comprovante de Pagamento (PIX) ou Gasto JÁ realizado.

                    EM SEGUIDA, EXTRAIA:
                    1. Descrição Sugerida (Nome do local ou serviço. Ex: "Uber", "Fatura Nubank", "Conta de Luz").
                    2. Valor TOTAL.
                    3. Data Relevante (Vencimento para PAYABLE, Data da Compra para TRANSACTION).
                    4. Categoria Sugerida (Ex: "Alimentação", "Transporte", "Moradia", "Cartão").

                    Retorne APENAS um JSON válido:
                    {
                        "type": "PAYABLE" | "TRANSACTION",
                        "description": "string",
                        "amount": number,
                        "date": "YYYY-MM-DD",
                        "category": "string"
                    }
                    Se não encontrar algum campo, retorne null, mas tente inferir o máximo possível.`
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
