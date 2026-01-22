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
    console.log('Started extractInvoiceData');
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('Missing OPENAI_API_KEY');
            return { error: 'Erro de configuração no servidor (API Key).' };
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { error: 'Unauthorized' };

        const file = formData.get('file') as File;
        if (!file) return { error: 'No file provided' };

        console.log(`Processing file: ${file.name}, size: ${file.size}`);

        // 1. Converter File para Buffer
        let text = '';
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const pdfData = await pdf(buffer);
            text = pdfData.text ? pdfData.text.slice(0, 4000) : '';
        } catch (pdfError: any) {
            console.error('PDF Parse Error:', pdfError);
            return { error: 'Não foi possível ler o conteúdo deste PDF. Ele pode ser uma imagem escaneada ou estar protegido.' };
        }

        if (!text || text.length < 10) {
            return { error: 'O PDF parece vazio ou ilegível (imagem?).' };
        }

        console.log('PDF text extracted, calling OpenAI...');

        // 3. Usar LLM para analisar e classificar
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
                    content: `Texto do Documento (Início):\n${text}`
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
        console.error('CRITICAL ERROR in extractInvoiceData:', error);
        return { error: `Erro ao processar documento: ${error.message || 'Erro interno'}. Tente manualmente.` };
    }
}

export async function createInvoicePayable(formData: FormData) {
    // Wrapper para reaproveitar a lógica de addPayable
    return await addPayable(formData);
}
