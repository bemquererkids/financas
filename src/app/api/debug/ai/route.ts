
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                status: 'error',
                message: 'Environment Variable GOOGLE_GENERATIVE_AI_API_KEY is missing/empty in production.'
            }, { status: 500 });
        }

        // Masked key for verification (first 4 chars ... last 4 chars)
        const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;

        const google = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        // Test with the EXACT model we are trying to use
        const modelName = 'gemini-2.0-flash';

        const start = Date.now();
        const { text } = await generateText({
            model: google(modelName),
            prompt: 'Ping. Are you alive? Reply with "PONG".'
        });
        const duration = Date.now() - start;

        return NextResponse.json({
            status: 'success',
            env_check: {
                has_key: true,
                key_preview: maskedKey
            },
            model_test: {
                model: modelName,
                response: text,
                latency_ms: duration
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error_type: error.name,
            message: error.message,
            stack: error.stack,
            env_check: {
                has_key: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
            }
        }, { status: 500 });
    }
}
