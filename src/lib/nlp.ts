import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- TIPAGEM AVANÇADA PARA INTENÇÕES ---
export type IntentType = 'TRANSACTION' | 'PLANNING' | 'INVESTMENT' | 'GOAL' | 'PAYABLE' | 'UNKNOWN';

export interface BaseIntentData {
    description: string;
    amount: number;
    category?: string;
    date?: Date;
}

export interface TransactionIntent extends BaseIntentData {
    type: 'INCOME' | 'EXPENSE';
    recurrence?: {
        frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
        count?: number;
        isInstallment?: boolean;
    };
}

export interface PlanningIntent extends BaseIntentData {
    month: string; // "YYYY-MM"
    type: 'INCOME' | 'EXPENSE';
}

export interface InvestmentIntent extends BaseIntentData {
    type: 'CONTRIBUTION' | 'WITHDRAWAL' | 'NEW_PROJECTION';
    // Dados extras para projeção podem ser adicionados aqui se necessário
}

export interface GoalIntent extends BaseIntentData {
    targetAmount: number;
    deadline?: Date;
}

export interface PayableIntent extends BaseIntentData {
    dueDate: Date;
    barcode?: string;
}

export interface ParsedIntent {
    intent: IntentType;
    found: boolean;
    data: TransactionIntent | PlanningIntent | InvestmentIntent | GoalIntent | PayableIntent | null;
}

// Prompt Mestre: O Cérebro que sabe distinguir tudo
const SYSTEM_PROMPT_KNOWLEDGE = `
    Você é um assistente financeiro pessoal inteligente (Brasil, BRL).
    Sua missão é classificar a intenção do usuário em uma das seguintes categorias:
    
    1. **TRANSACTION**: Gastos ou Receitas JÁ realizados ou recorrentes no presente. (ex: "Gastei 50", "Salário caiu", "Assinei Netflix").
    2. **PLANNING**: Planejamento, orçamento futuro, "quero gastar X no mês Y". (ex: "Planeje gastar 500 em Lazer mês que vem", "Orçamento de mercado para Dezembro").
    3. **INVESTMENT**: Aportes em investimentos ou criação de simulações. (ex: "Investi 1000 no CDB", "Vou aplicar 500 na Bolsa").
    4. **GOAL**: Criação de novas metas/sonhos financeiros. Apenas se disser explicitamente "nova meta" ou "objetivo". (ex: "Nova meta: Carro, 50k", "Quero juntar para viagem").
    5. **PAYABLE**: Contas a pagar, Boletos, Dívidas futuras com data de vencimento. Usado quando há uma data de vencimento futura clara. (ex: "Boleto da Net vence dia 15 valor 100", "Pagar luz dia 20").

    Categorias Padrão: "Moradia", "Mercado", "Transporte", "Lazer", "Saúde", "Educação", "Compras", "Investimento", "Salário", "Extras", "Contas".
`;

// Função Principal de Processamento
export async function processIntent(text: string): Promise<ParsedIntent | null> {
    try {
        const prompt = `
            ${SYSTEM_PROMPT_KNOWLEDGE}
            Hoje é: ${new Date().toISOString()}.
            
            Analise o texto: "${text}"

            Retorne JSON estrito:
            {
                "found": true|false,
                "intent": "TRANSACTION" | "PLANNING" | "INVESTMENT" | "GOAL" | "PAYABLE",
                "data": {
                    // Campos comuns
                    "description": "string (curta e clara)",
                    "amount": 0.00 (sempre positivo),
                    "category": "string (categoria mais adequada)",
                    
                    // Se TRANSACTION:
                    "type": "EXPENSE" | "INCOME",
                    "date": "YYYY-MM-DD",
                    "recurrence": { "frequency": "MONTHLY"|"WEEKLY"|null, "count": number|null, "isInstallment": boolean } (opcional, ex: "todo mês")

                    // Se PLANNING:
                    "month": "YYYY-MM",
                    "type": "EXPENSE" | "INCOME"

                    // Se INVESTMENT:
                    "type": "CONTRIBUTION" | "WITHDRAWAL" | "NEW_PROJECTION",
                    "date": "YYYY-MM-DD"

                    // Se GOAL:
                    "targetAmount": 0.00 (valor total da meta, se houver),
                    "deadline": "YYYY-MM-DD" (opcional)

                    // Se PAYABLE:
                    "dueDate": "YYYY-MM-DD",
                    "barcode": "string" (opcional)
                }
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message?.content || "{}";
        const json = JSON.parse(content);

        if (!json.found) return { intent: 'UNKNOWN', found: false, data: null };

        // Processar datas strings para Date objects
        if (json.data?.date) json.data.date = new Date(json.data.date);
        if (json.data?.dueDate) json.data.dueDate = new Date(json.data.dueDate);
        if (json.data?.deadline) json.data.deadline = new Date(json.data.deadline);

        return {
            intent: json.intent,
            found: true,
            data: json.data
        };
    } catch (error) {
        console.error("Erro NLP Intent:", error);
        return null;
    }
}

// Wrapper legado compatível (mantém funcionamento do código antigo, mas expondo novos campos)
export async function parseTransactionCheck(text: string): Promise<any | null> {
    const result = await processIntent(text);

    if (!result || !result.found) return null;

    // Se for TRANSACTION, mapeia para o formato antigo para garantir compatibilidade
    if (result.intent === 'TRANSACTION') {
        const data = result.data as TransactionIntent;
        return {
            found: true,
            intent: 'TRANSACTION', // Campo novo exposto
            description: data.description,
            amount: data.amount,
            category: data.category || 'Outros',
            type: data.type,
            date: data.date || new Date(),
            recurrence: data.recurrence
        };
    }

    // Se for OUTROS (Planning, Goal, etc), retorna com a flag 'intent'
    // O Webhook deverá checar msg.intent
    return {
        found: true,
        intent: result.intent,
        ...result.data,
        type: (result.data as any).type || 'EXPENSE' // Fallback para evitar erro de acesso a propriedade
    };
}

export async function analyzeImageTransaction(base64Image: string): Promise<any | null> {
    try {
        const prompt = `
            ${SYSTEM_PROMPT_KNOWLEDGE}
            Hoje é: ${new Date().toISOString()}.
            
            Analise esta imagem.
            Identifique se é:
            - TRANSACTION (Cupom fiscal, recibo de pagamento imediato)
            - PAYABLE (Boleto bancário, conta de luz/água com vencimento futuro)
            
            Retorne JSON igual ao formato de texto (com campo "intent").
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

        // Normalização de datas
        if (json.data?.date) json.data.date = new Date(json.data.date);
        if (json.data?.dueDate) json.data.dueDate = new Date(json.data.dueDate);

        // Adaptação para retorno flexível
        return {
            found: true,
            intent: json.intent || 'TRANSACTION',
            ...json.data,
            type: json.data?.type || 'EXPENSE'
        };

    } catch (error) {
        console.error("Erro Vision NLP:", error);
        return null;
    }
}

export async function transcribeAudioMessage(base64Audio: string): Promise<string | null> {
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);
    try {
        const buffer = Buffer.from(base64Audio, 'base64');
        fs.writeFileSync(tempFilePath, buffer);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "pt",
        });

        return transcription.text;
    } catch (error) {
        console.error("Erro Whisper:", error);
        return null;
    } finally {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
}
