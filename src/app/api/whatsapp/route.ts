
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AiAssistant } from '@/lib/ai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Payload Normalization (Uazapi/Evolution variations)
        // Sometimes it's inside 'data', sometimes direct, sometimes 'message'
        const message = body?.data?.message || body?.message || body;

        if (!message) {
            console.log('Webhook ignored: No message structure found', JSON.stringify(body).slice(0, 100));
            return NextResponse.json({ status: 'ignored' });
        }

        // Check if it's from me (exclude 'fromMe': true to avoid endless loops if we reply)
        if (message.key?.fromMe) {
            return NextResponse.json({ status: 'ignored', reason: 'from_me' });
        }

        let textToProcess = '';
        let tempFilePath = '';

        // 2. Audio Processing
        const audioMessage = message.audioMessage || (message.type === 'audio' ? message : null);

        if (audioMessage) {
            console.log('Audio received. Processing...');
            const fileName = `${uuidv4()}.mp3`;
            tempFilePath = join('/tmp', fileName);

            // Scenario A: Base64 provided
            if (audioMessage.base64) {
                await writeFile(tempFilePath, Buffer.from(audioMessage.base64, 'base64'));
            }
            // Scenario B: URL provided (Download it)
            else if (audioMessage.url) {
                console.log('Downloading audio from URL:', audioMessage.url);
                const response = await fetch(audioMessage.url);
                if (!response.ok) throw new Error(`Failed to download audio: ${response.statusText}`);

                const arrayBuffer = await response.arrayBuffer();
                await writeFile(tempFilePath, Buffer.from(arrayBuffer));
            } else {
                console.log('Audio message without base64 or url');
                return NextResponse.json({ status: 'error', reason: 'no_media_data' });
            }

            // Transcribe
            if (fs.existsSync(tempFilePath)) {
                textToProcess = await AiAssistant.transcribeAudio(tempFilePath);
                console.log('Audio transcribed:', textToProcess);
            }
        }
        // 3. Text Processing
        else {
            textToProcess = message.conversation || message.extendedTextMessage?.text || message.text?.body;
        }

        if (!textToProcess) {
            return NextResponse.json({ status: 'ignored', reason: 'no_content' });
        }

        // 4. AI Extraction
        const extraction = await AiAssistant.parseTransactionFromText(textToProcess);

        if (extraction.intent === 'CREATE_TRANSACTION' && extraction.amount) {
            const newTransaction = await prisma.transaction.create({
                data: {
                    amount: extraction.amount,
                    description: extraction.description || 'Via WhatsApp',
                    category: extraction.category || 'Outros',
                    type: extraction.type || 'EXPENSE',
                    date: new Date(),
                    // Optional: You could add a 'source: whatsapp' field if you update schema
                }
            });

            console.log('Transaction created:', newTransaction);

            // Success!
            // TODO: Call Uazapi to send confirmation message back to user if desired
        } else {
            console.log('Intent not clear or no amount found:', extraction);
        }

        // Cleanup
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            await unlink(tempFilePath).catch(() => { });
        }

        return NextResponse.json({ status: 'success', extraction });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
    }
}
