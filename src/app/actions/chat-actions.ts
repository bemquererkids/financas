'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildFinancialContext } from '@/lib/ai/context';
import OpenAI from 'openai';

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        // 4. Get History (Last 6 messages for continuity)
        const history = await prisma.chatMessage.findMany({
            where: { sessionId: currentSessionId },
            orderBy: { createdAt: 'desc' },
            take: 6
        });

        // Convert to OpenAI format (reverse back to chronological)
        const historyformatted = history.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
        }));

        // 5. Call LLM
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo
            messages: [
                { role: "system", content: `Você é um consultor financeiro pessoal avançado. Use o contexto abaixo para responder.\n\n${systemContext}` },
                ...historyformatted
            ],
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content || "Desculpe, não consegui processar sua resposta.";

        // 6. Save Assistant Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId!,
                role: 'assistant',
                content: reply
            }
        });

        // 7. Memory Extraction (Fire and Forget - could be a separate job)
        // We attempt to extract facts if the user message contains personal info keywords
        if (message.length > 20) {
            extractFacts(userId, message);
        }

        return { success: true, sessionId: currentSessionId, message: reply };

    } catch (error) {
        console.error("Chat Error:", error);
        return { success: false, error: "Failed to process message" };
    }
}

// Background Function to Extract Facts
async function extractFacts(userId: string, userMessage: string) {
    try {
        const extraction = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Extract any permanent user facts, goals, or constraints from the text. Return ONLY valid JSON: { facts: [{ fact: string, category: string }] }. If none, return { facts: [] }." },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(extraction.choices[0].message.content || "{}");

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
        // Silent fail for extraction
        console.error("Fact extraction failed", e);
    }
}
