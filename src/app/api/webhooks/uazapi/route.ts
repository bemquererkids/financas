import { NextResponse } from 'next/server';
import { parseTransactionCheck } from '@/lib/nlp';
import { prisma } from '@/lib/prisma';

// Configurações
const MY_PHONE_NUMBER = process.env.MY_WHATSAPP_NUMBER;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const eventType = body.EventType || body.type || 'unknown';
        console.log(`📨 [WEBHOOK] Evento: ${eventType}`);

        if (eventType === 'presence') {
            return NextResponse.json({ status: 'ignored_presence' });
        }

        // Estratégia de extração da mensagem
        const msgObject = (Array.isArray(body.messages) ? body.messages[0] : null) ||
            (Array.isArray(body.data) ? body.data[0] : null) ||
            body.data?.message ||
            body.message ||
            body;

        if (!msgObject) {
            console.log("❌ Estrutura msgObject não encontrada. Keys:", Object.keys(body));
            return NextResponse.json({ status: 'unknown_structure', keys: Object.keys(body) });
        }

        // --- RAIO-X DEBUG ---
        // Esse log vai salvar nossa vida: mostra exatamente o que recebemos
        console.log("📦 [DEBUG] msgObject Encontrado:", JSON.stringify(msgObject).substring(0, 1000));
        // --------------------

        // Extrair quem mandou
        const remoteJid = msgObject.key?.remoteJid ||
            msgObject.from ||
            msgObject.remoteJid ||
            msgObject.chatId ||
            "";

        const isFromMe = msgObject.key?.fromMe || msgObject.fromMe || false;

        console.log(`👤 Remetente: "${remoteJid}" (Sou eu? ${isFromMe})`);

        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Validação de segurança
        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');

            if (!cleanRemote.includes(cleanMyNumber)) {
                console.log(`⛔ Bloqueado: ${cleanRemote} não é ${cleanMyNumber}`);
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // Extrair texto (Tentativa Bruta)
        const messageContent = msgObject.message || msgObject;
        const text = messageContent.conversation ||
            messageContent.extendedTextMessage?.text ||
            messageContent.textMessage?.text || // Evolution v2
            messageContent.text?.body ||
            messageContent.body ||
            "";

        console.log(`📝 Texto extraído: "${text}"`);

        if (!text) return NextResponse.json({ status: 'no_text' });

        // 1. IA
        console.log("🧠 Enviando para IA...");
        const transaction = await parseTransactionCheck(text);
        console.log("🧠 Resultado IA:", JSON.stringify(transaction));

        if (!transaction || !transaction.found) {
            console.log("🤷‍♂️ IA não detectou transação.");
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // 2. Salva no banco
        console.log("💾 Salvando ID no Postgres...");
        const saved = await prisma.transaction.create({
            data: {
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
            }
        });
        console.log(`✅ Salvo ID: ${saved.id}`);

        // 3. Responde
        const replyText = `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`;

        console.log("📤 Respondendo...");
        await sendWhatsAppReply(remoteJid, replyText);

        return NextResponse.json({ success: true, savedId: saved.id });

    } catch (error) {
        console.error("❌ ERRO WEBHOOK:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

async function sendWhatsAppReply(to: string, text: string) {
    const apiUrl = process.env.UAZAPI_URL;
    const apiKey = process.env.UAZAPI_API_KEY;

    if (!apiUrl || !apiKey) {
        console.error("⚠️ Variaveis UAZAPI faltando.");
        return;
    }

    try {
        const payload = {
            number: String(to).replace('@s.whatsapp.net', ''),
            textMessage: {
                text: text
            },
            options: {
                delay: 1000,
                presence: 'composing'
            }
        };

        console.log("📦 [ENVIO] Payload Envio:", JSON.stringify(payload));
        console.log("📡 [ENVIO] URL Destino:", apiUrl);

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        const responseText = await res.text();
        console.log(`🔄 Envio Status: ${res.status} | Body: ${responseText}`);

    } catch (e) {
        console.error("❌ Erro fetch envio:", e);
    }
}
