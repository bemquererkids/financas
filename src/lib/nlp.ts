import OpenAI from 'openai';

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

export async function parseTransactionCheck(text: string): Promise<ParsedTransaction | null> {
    try {
        const prompt = `
            Analise a seguinte mensagem enviada no WhatsApp e extraia os dados financeiros, se houver.
            Hoje é: ${new Date().toISOString()}.
            
            Mensagem: "${text}"

            Retorne APENAS um JSON (sem markdown) no seguinte formato:
            {
                "found": true, // se encontrou intenção de gasto/ganho
                "description": "descrição curta",
                "amount": 0.00, // número positivo
                "type": "EXPENSE" ou "INCOME",
                "category": "Moradia" | "Mercado" | "Transporte" | "Lazer" | "Saúde" | "Educação" | "Investimento" | "Salário" | "Outros",
                "date": "YYYY-MM-DD" // data mencionada ou hoje
            }
            
            Se não for uma transação, retorne { "found": false }.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        const content = response.choices[0].message?.content || "{}";
        const json = JSON.parse(content.replace(/```json|```/g, '').trim());

        if (!json.found) return null;

        return {
            ...json,
            date: new Date(json.date)
        };
    } catch (error) {
        console.error("Erro ao interpretar NLP:", error);
        return null;
    }
}
