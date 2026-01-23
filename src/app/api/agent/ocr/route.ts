import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_API_KEY,
});

// Schema de validação para dados extraídos
const TransactionDataSchema = z.object({
    date: z.string().nullable().describe('Data da transação no formato YYYY-MM-DD'),
    amount: z.number().nullable().describe('Valor total da transação (apenas número, ex: 45.90)'),
    description: z.string().nullable().describe('Nome do estabelecimento ou descrição'),
    category: z.enum(['FOOD', 'TRANSPORT', 'HOUSING', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'SHOPPING', 'SERVICES', 'SUBSCRIPTIONS', 'BANKING', 'DENTIST', 'PETS', 'OTHER']).nullable().describe('Categoria sugerida'),
    confidence: z.number().min(0).max(1).describe('Nível de confiança da extração (0-1)')
});

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
    console.log('🚀 OCR endpoint called');

    try {
        // Autenticação
        const session = await getServerSession(authOptions);
        console.log('🔐 Auth check:', { hasSession: !!session, userId: session?.user?.id });

        if (!session?.user?.id) {
            return Response.json({
                success: false,
                error: 'Não autenticado'
            }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image || !image.startsWith('data:image')) {
            return Response.json({
                success: false,
                error: 'Imagem inválida'
            }, { status: 400 });
        }

        // Extrair base64 da imagem
        const base64Data = image.split(',')[1];
        console.log('📸 Image received, size:', base64Data.length, 'chars');

        const systemPrompt = `Você é um especialista em extração de dados de recibos, notas fiscais e boletos brasileiros.

TAREFA: Analise a imagem fornecida e extraia as seguintes informações:

1. **Data da transação**: Procure por dicas de datas no formato DD/MM/YYYY ou DD/MM/YY. Converta para YYYY-MM-DD.
2. **Valor total**: Identifique o valor TOTAL da compra (geralmente o maior valor ou marcado como "TOTAL"). Remova símbolos de moeda e converta vírgula para ponto.
3. **Estabelecimento/Descrição**: Nome da loja, restaurante ou empresa.
4. **Categoria**: Classifique a transação com inteligência:
   - FOOD: Supermercados, restaurantes, padarias, delivery, cafeteria
   - TRANSPORT: Uber, combustível, estacionamento, pedágio, passagens
   - HOUSING: Aluguel, condomínio, água, luz, internet, reforma
   - ENTERTAINMENT: Cinema, streaming, eventos, lazer, bares
   - HEALTH: Farmácia, consultas, exames
   - EDUCATION: Cursos, livros, mensalidade escolar
   - SHOPPING: Roupas, eletrônicos, presentes, lojas de departamento
   - SERVICES: Salão, lavanderia, reparos, jardinagem
   - SUBSCRIPTIONS: Netflix, Spotify, assinaturas recorrentes
   - BANKING: Faturas de cartão (Itaucard, Nubank), anuidades, taxas bancárias
   - DENTIST: Tratamentos dentários, ortodontia
   - PETS: Petshop, veterinário, ração
   - OTHER: Somente se não encaixar em NADA acima.

REGRAS DE INTELIGÊNCIA:
- Se vir "Itaucard", "Nubank", "Banco", "Fatura", classifique como BANKING.
- Se vir nomes de restaurantes ou padarias, use FOOD.
- Seja muito inteligente na classificação para EVITAR a categoria OTHER.

REGRAS IMPORTANTES:
- Se não conseguir identificar algum campo com certeza, retorne null
- Valores devem ser numéricos (sem R$, sem vírgulas)
- Datas no formato ISO (YYYY-MM-DD)
- O campo "confidence" deve refletir sua certeza geral (0.0 a 1.0)
- Se a imagem estiver muito borrada ou ilegível, retorne confidence < 0.5`;

        console.log('🤖 Calling Gemini Vision API...');

        // Usar Gemini Vision com structured output
        const result = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: TransactionDataSchema,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: systemPrompt + '\n\nAnalise esta imagem e extraia os dados da transação:' },
                        { type: 'image', image: base64Data }
                    ]
                }
            ]
        });

        const extracted = result.object;
        console.log('✅ OCR Result:', extracted);

        // Guardrail: Validar confiança mínima
        if (extracted.confidence < 0.5) {
            return Response.json({
                success: false,
                error: 'Imagem com baixa qualidade ou ilegível. Por favor, tire outra foto com melhor iluminação e foco.',
                confidence: extracted.confidence
            }, { status: 400 });
        }

        // Guardrail: Validar se pelo menos um campo foi extraído
        if (!extracted.date && !extracted.amount && !extracted.description) {
            return Response.json({
                success: false,
                error: 'Não foi possível identificar dados de transação na imagem. Certifique-se de que é um recibo ou nota fiscal.',
                confidence: extracted.confidence
            }, { status: 400 });
        }

        // Retornar dados extraídos para confirmação do usuário
        return Response.json({
            success: true,
            data: {
                date: extracted.date || new Date().toISOString().split('T')[0],
                amount: extracted.amount,
                description: extracted.description || 'Transação via imagem',
                category: extracted.category || 'OTHER',
                confidence: extracted.confidence
            }
        });

    } catch (error: any) {
        console.error('❌ OCR Error:', error);
        return Response.json({
            success: false,
            error: `Erro ao processar imagem: ${error.message}`
        }, { status: 500 });
    }
}
