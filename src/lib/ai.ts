import OpenAI from 'openai';
import fs from 'fs';

// Initialize OpenAI only if key is present to avoid build errors
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export type ExtractedTransaction = {
    intent: 'CREATE_TRANSACTION' | 'UNKNOWN';
    amount?: number;
    description?: string;
    category?: string;
    type?: 'INCOME' | 'EXPENSE';
};

export class AiAssistant {
    /**
     * Transcribes audio file to text using Whisper
     */
    static async transcribeAudio(filePath: string): Promise<string> {
        if (!openai) throw new Error('OPENAI_API_KEY not found');

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            language: 'pt',
        });

        return transcription.text;
    }

    /**
     * Extracts structured transaction data from text using GPT
     */
    static async parseTransactionFromText(text: string): Promise<ExtractedTransaction> {
        if (!openai) throw new Error('OPENAI_API_KEY not found');

        Você é um assistente financeiro pessoal.Analise a frase do usuário e extraia os dados da transação.

            IMPORTANTE: Tente mapear para uma das seguintes categorias exatas se possível:
        - Renda: SALARIO, RENDA_EXTRA
            - Deduções: PAYROLL_DEDUCTION(Consignado / Empréstimo em Folha / Previdência), Adiantamento
                - Casa: Moradia, Condominio, Luz, Agua, Gas, Internet, Telefone Fixo, Celular, Diarista, IPTU
                    - Transporte: Gasolina, Uber, Transporte
                        - Alimentação: Mercado, Restaurante
                            - Saúde: Convenio, Terapia, Academia, Personal
                                - Estética: Estetica(inclui Cabelo, Unha, Salão, Depilação, Sobrancelha, Barba)
                                    - Pets: Comida Pet, Banho Pet
                                        - Carro: Parcela Carro, Seguro Carro
                                            - Outros: Educacao, Dizimo, Netflix, Spotify, Lazer, CREDIT_CARD_BILL(Pagamento de Fatura)

      Se não encaixar perfeitamente, use "OUTROS" ou a mais próxima.
      
      Retorne APENAS um JSON estrito, sem markdown, no formato:
        {
            "intent": "CREATE_TRANSACTION" | "UNKNOWN",
                "amount": number(float, exemplo: 50.00),
                    "description": string(curta, ex: "Conta de Luz"),
                        "category": string(exatamente como na lista acima),
                            "type": "INCOME" | "EXPENSE"
        }

      Frase do usuário: "${text}"
            `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini', // Fast and cheap
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('Falha na IA');

        return JSON.parse(content) as ExtractedTransaction;
    }
}
