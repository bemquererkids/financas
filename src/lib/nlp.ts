import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedTransaction {
    description: string;
    amount: number;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    date: Date;
    found: boolean;
}

// Prompt unificado para garantir consistência
const SYSTEM_PROMPT_KNOWLEDGE = `
    Você é um assistente financeiro especialista em categorizar gastos pessoais no Brasil.
    Categorias permitidas: "Moradia", "Mercado", "Transporte", "Lazer", "Saúde", "Educação", "Compras", "Investimento", "Salário", "Extras", "Outros".
    Moeda: BRL (R$).
    Se o usuário mandar foto de nota fiscal, extraia o total e a categoria do estabelecimento.
    Se o usuário mandar áudio, entenda a intenção.
`;

export async function parseTransactionCheck(text: string): Promise<ParsedTransaction | null> {
    try {
        const prompt = `
            ${SYSTEM_PROMPT_KNOWLEDGE}
            Hoje é: ${new Date().toISOString()}.
            
            Analise este texto: "${text}"

            Retorne APENAS um JSON (sem markdown):
            {
                "found": true|false,
                "description": "descrição curta (ex: Almoço, Uber)",
                "amount": 0.00,
                "type": "EXPENSE" | "INCOME",
                "category": "Categoria mais adequada",
                "date": "YYYY-MM-DD"
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Upgrade para 4o para melhor entendimento
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message?.content || "{}";
        const json = JSON.parse(content);

        if (!json.found) return null;

        return {
            ...json,
            date: new Date(json.date)
        };
    } catch (error) {
        console.error("Erro ao interpretar NLP (Texto):", error);
        return null;
    }
}

export async function analyzeImageTransaction(base64Image: string): Promise<ParsedTransaction | null> {
    try {
        const prompt = `
            ${SYSTEM_PROMPT_KNOWLEDGE}
            Hoje é: ${new Date().toISOString()}.
            
            Analise esta imagem (Nota Fiscal, Recibo ou Comprovante).
            Extraia o valor TOTAL pago, o nome do estabelecimento (para descrição) e categorise.

            Retorne APENAS um JSON (igual ao formato de texto):
            {
                "found": true|false,
                "description": "Nome do Estabelecimento ou item principal",
                "amount": 0.00,
                "type": "EXPENSE" | "INCOME",
                "category": "Categoria",
                "date": "YYYY-MM-DD" (data da nota ou hoje)
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": `data:image/jpeg;base64,${base64Image}`
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        });

        const content = response.choices[0].message?.content || "{}";
        const json = JSON.parse(content);

        if (!json.found) return null;

        return {
            ...json,
            date: new Date(json.date)
        };

    } catch (error) {
        console.error("Erro ao analisar Imagem (Vision):", error);
        return null;
    }
}

export async function transcribeAudioMessage(base64Audio: string): Promise<string | null> {
    // Whisper requer arquivo físico ou Stream com path
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.mp3`); // Supondo mp3/ogg. O Whisper aceita.

    try {
        // Converter base64 pra arquivo temporário
        const buffer = Buffer.from(base64Audio, 'base64');
        fs.writeFileSync(tempFilePath, buffer);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "pt", // Otimiza para português
        });

        return transcription.text;

    } catch (error) {
        console.error("Erro ao transcrever Áudio (Whisper):", error);
        return null;
    } finally {
        // Limpar arquivo temporário
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}
