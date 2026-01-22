'use server';

import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addPayable } from './payment-actions';

// pdf-parse usually exports via module.exports, so require is safer in node env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function extractInvoiceData(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        // 1. Converter File para Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Extrair Texto do PDF
        const pdfData = await pdf(buffer);
        const text = pdfData.text.slice(0, 3000); // Pegar os primeiros 3k caracteres

        if (!text || text.length < 10) {
            return { error: 'Não foi possível ler o texto do PDF.' };
        }

        // 3. Usar LLM para analisar
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `Você é um extrator de dados de fatura de cartão de crédito.
                    Analise o texto fornecido e extraia:
                    1. Nome do Cartão/Banco (ex: Nubank, Itaú, XP).
                    2. Valor TOTAL da fatura (fechada ou atual).
                    3. Data de Vencimento (formato YYYY-MM-DD).
                    
                    Retorne APENAS um JSON válido no formato:
                    {
                        "bankName": "string",
                        "amount": number, // exemplo: 1250.50
                        "dueDate": "YYYY-MM-DD"
                    }
                    Se não encontrar algum campo, retorne null nele.`
                },
                {
                    role: "user",
                    content: `Texto da Fatura:\n${text}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) return { error: 'Failed to extract data' };

        const data = JSON.parse(content);
        return { success: true, data };

    } catch (error) {
        console.error('Invoice Extraction Error:', error);
        return { error: 'Erro ao processar o arquivo. Tente manualmente.' };
    }
}

export async function createInvoicePayable(formData: FormData) {
    // Wrapper para reaproveitar a lógica de addPayable
    return await addPayable(formData);
}
