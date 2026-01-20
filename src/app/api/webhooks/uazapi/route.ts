import { NextResponse } from 'next/server';
import { parseTransactionCheck } from '@/lib/nlp';
import { prisma } from '@/lib/prisma';

// Configurações
const MY_PHONE_NUMBER = process.env.MY_WHATSAPP_NUMBER;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("📨 [WEBHOOK] Recebido Payload Bruto:", JSON.stringify(body).substring(0, 500) + "...");

        // Adaptação para estrutura
        // Evolution/UAZAPI v2 costuma mandar em 'data.message' ou 'data'
        const messageData = body.data?.message || body.message || body.data || body;

        // Extrair quem mandou
        const remoteJid = messageData.key?.remoteJid || messageData.from || messageData.remoteJid;
        const isFromMe = messageData.key?.fromMe || messageData.fromMe || false;

        console.log(`👤 [WEBHOOK] Remetente: ${remoteJid}, É meu?: ${isFromMe}`);

        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        if (MY_PHONE_NUMBER) {
            // Remove caracteres não numéricos para comparação segura
            const cleanRemote = (remoteJid || '').replace(/\D/g, '');
            const cleanMyNumber = MY_PHONE_NUMBER.replace(/\D/g, '');

            if (!cleanRemote.includes(cleanMyNumber)) {
                console.log(`⛔ [WEBHOOK] Ignorado: Número ${cleanRemote} não autorizado.`);
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // Extrair texto
        const text = messageData.conversation ||
            messageData.extendedTextMessage?.text ||
            messageData.body ||
            messageData.text?.body ||
            "";

        console.log(`📝 [WEBHOOK] Texto extraído: "${text}"`);

        if (!text) return NextResponse.json({ status: 'no_text' });

        // 1. IA
        console.log("🧠 [IA] Processando texto...");
        const transaction = await parseTransactionCheck(text);
        console.log("🧠 [IA] Resultado:", JSON.stringify(transaction));

        if (!transaction || !transaction.found) {
            console.log("🤷‍♂️ [IA] Nenhuma transação identificada.");
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // 2. Salva no banco
        console.log("💾 [DB] Salvando transação...");
        const saved = await prisma.transaction.create({
            data: {
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
            }
        });
        console.log(`✅ [DB] Salvo com ID: ${saved.id}`);

        // 3. Responde
        const replyText = `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`;

        console.log("📤 [API] Tentando enviar resposta para:", remoteJid);
        await sendWhatsAppReply(remoteJid, replyText);

        return NextResponse.json({ success: true, savedId: saved.id });

    } catch (error) {
        console.error("❌ [ERRO CRÍTICO] Webhook falhou:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

async function sendWhatsAppReply(to: string, text: string) {
    const apiUrl = process.env.UAZAPI_URL;
    const apiKey = process.env.UAZAPI_API_KEY;

    console.log(`📡 [ENVIO] URL: ${apiUrl}, Key (início): ${apiKey?.substring(0, 5)}...`);

    if (!apiUrl || !apiKey) {
        console.error("⚠️ [ENVIO] Variáveis UAZAPI não configuradas!");
        return;
    }

    try {
        // Formato Evolution v2 / UAZAPI
        const payload = {
            number: to.replace('@s.whatsapp.net', ''),
            textMessage: {
                text: text
            },
            options: {
                delay: 1000,
                presence: 'composing'
            }
        };

        console.log("📦 [ENVIO] Payload:", JSON.stringify(payload));

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        const responseData = await res.text();
        console.log(`🔄 [ENVIO] Status: ${res.status}, Resposta: ${responseData}`);

    } catch (e) {
        console.error("❌ [ENVIO] Falha na requisição fetch:", e);
    }
}
