'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildFinancialContext } from '@/lib/ai/context';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function sendMessage(message: string, sessionId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    try {
        // 1. Create or Get Session
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = await prisma.chatSession.create({
                data: {
                    userId,
                    title: message.substring(0, 30) + "..."
                }
            });
            currentSessionId = newSession.id;
        }

        // 2. Save User Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId!,
                role: 'user',
                content: message
            }
        });

        // 3. Build Context (RAG)
        const systemContext = await buildFinancialContext(userId);

        // 4. Get History (Last 10 messages for continuity) - Gemini supports larger context
        const history = await prisma.chatMessage.findMany({
            where: { sessionId: currentSessionId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Convert to Gemini format (user/model roles)
        // Gemini expects 'user' and 'model' roles. history has 'user', 'assistant'.
        const chatHistory = history.reverse().map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // 5. Call LLM
        // We start a chat session with history + system context injected in the first message or system instruction
        // Since Gemini Pro (node) works best with startChat
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `System Instruction: Você é um consultor financeiro pessoal avançado. Use o contexto financeiro abaixo para responder de forma personalizada e precisa.\n\nCONTEXTO:\n${systemContext}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Entendido. Estou pronto para ajudar com base no contexto financeiro fornecido." }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const reply = response.text();

        // 6. Save Assistant Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId!,
                role: 'assistant',
                content: reply
            }
        });

        // 7. Memory Extraction (Fire and Forget)
        if (message.length > 20) {
            extractFacts(userId, message);
        }

        return { success: true, sessionId: currentSessionId, message: reply };

    } catch (error) {
        console.error("Chat Error:", error);
        return { success: false, error: "Falha ao processar mensagem. Verifique a chave de API." };
    }
}

// Background Function to Extract Facts
async function extractFacts(userId: string, userMessage: string) {
    try {
        // Use a cheaper/faster call or same model
        const factModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Analise o texto abaixo e extraia fatos importantes sobre o usuário, objetivos ou restrições financeiras. 
        Retorne APENAS um JSON válido no formato: { "facts": [{ "fact": "string", "category": "GOAL|PERSONAL|CONSTRAINT" }] }.
        Se não houver nada relevante, retorne { "facts": [] }.
        
        Texto: "${userMessage}"`;

        const result = await factModel.generateContent(prompt);
        const text = result.response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        if (data.facts && Array.isArray(data.facts) && data.facts.length > 0) {
            for (const item of data.facts) {
                await prisma.userFact.create({
                    data: {
                        userId,
                        fact: item.fact,
                        category: item.category || 'PERSONAL',
                        confidence: 0.9
                    }
                });
            }
        }
    } catch (e) {
        console.error("Fact extraction failed", e);
    }
}

