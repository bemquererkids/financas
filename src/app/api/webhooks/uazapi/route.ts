import { NextResponse } from 'next/server';
import { parseTransactionCheck, analyzeImageTransaction, transcribeAudioMessage } from '@/lib/nlp';
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
            console.log("❌ Estrutura msgObject não encontrada.");
            return NextResponse.json({ status: 'unknown_structure' });
        }

        // Extrair quem mandou
        const remoteJid = msgObject.sender ||
            msgObject.key?.remoteJid ||
            msgObject.from ||
            msgObject.remoteJid ||
            "";

        const isFromMe = msgObject.key?.fromMe || msgObject.fromMe || false;

        console.log(`👤 Remetente: "${remoteJid}" (Sou eu? ${isFromMe})`);

        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');
            if (!cleanRemote.includes(cleanMyNumber)) {
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // ---PROCESSAMENTO---
        const messageInfo = msgObject.message || msgObject;
        const contentObj = (typeof msgObject.content === 'object' && msgObject.content !== null) ? msgObject.content : {};

        let transaction = null;
        let fileBase64 = null;

        // 1. ÁUDIO
        const isAudio = messageInfo.audioMessage ||
            msgObject.messageType === 'audioMessage' ||
            msgObject.type === 'audio' ||
            msgObject.mediaType === 'ptt' ||
            (contentObj.mimetype && contentObj.mimetype.includes('audio'));

        if (isAudio) {
            console.log("🎤 Áudio detectado! Iniciando resgate...");

            if (msgObject.base64 || contentObj.base64) {
                fileBase64 = msgObject.base64 || contentObj.base64;
            } else {
                fileBase64 = await fetchBase64FromUAZAPI(msgObject);
            }

            if (fileBase64) {
                const transcription = await transcribeAudioMessage(fileBase64);
                console.log(`🎤 Transcrição: "${transcription}"`);
                if (transcription) {
                    transaction = await parseTransactionCheck(transcription);
                }
            } else {
                console.log("⚠️ Áudio perdido (Falha no Download ou Base64).");
                await sendWhatsAppReply(remoteJid, "⚠️ Não consegui baixar seu áudio.");
            }
        }

        // 2. IMAGEM
        else if (messageInfo.imageMessage ||
            msgObject.messageType === 'imageMessage' ||
            msgObject.type === 'image' ||
            (contentObj.mimetype && contentObj.mimetype.includes('image'))) {

            console.log("📸 Imagem detectada! Iniciando resgate...");

            if (msgObject.base64 || contentObj.base64) {
                fileBase64 = msgObject.base64 || contentObj.base64;
            } else {
                fileBase64 = await fetchBase64FromUAZAPI(msgObject);
            }

            // Fallback Thumbnail
            if (!fileBase64) {
                fileBase64 = messageInfo.imageMessage?.JPEGThumbnail || msgObject.JPEGThumbnail || contentObj.JPEGThumbnail;
                if (fileBase64) console.log("⚠️ Usando Thumbnail (Fallback).");
            }

            if (fileBase64) {
                transaction = await analyzeImageTransaction(fileBase64);
            } else {
                console.log("⚠️ Imagem perdida.");
                await sendWhatsAppReply(remoteJid, "⚠️ Não consegui baixar sua imagem.");
            }
        }

        // 3. TEXTO
        else {
            const textFromContent = (typeof msgObject.content === 'string') ? msgObject.content : (msgObject.content?.text || msgObject.content?.caption || "");
            const text = messageInfo.text ||
                textFromContent ||
                messageInfo.conversation ||
                messageInfo.extendedTextMessage?.text ||
                messageInfo.textMessage?.text ||
                messageInfo.body || "";

            const cleanText = (typeof text === 'object') ? JSON.stringify(text) : text;
            console.log(`📝 Texto: "${cleanText}"`);

            if (cleanText && cleanText.length > 1 && !cleanText.includes("[object Object]")) {
                transaction = await parseTransactionCheck(cleanText);
            }
        }

        if (!transaction || !transaction.found) {
            if (!isAudio && !(messageInfo.imageMessage)) {
                // await sendWhatsAppReply(remoteJid, "❌ Não entendi.");
            }
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // Lógica de Salvamento e Recorrência
        const recurrence = transaction.recurrence;
        const count = recurrence?.count || 1;
        const isInstallment = recurrence?.isInstallment || false;

        console.log(`💾 Salvando ${count}x ${transaction.type} de R$ ${transaction.amount}...`);

        let savedId = "";
        const baseDate = new Date(transaction.date);

        for (let i = 0; i < count; i++) {
            const currentDate = new Date(baseDate);
            currentDate.setMonth(baseDate.getMonth() + i);

            let description = transaction.description;
            if (isInstallment && count > 1) {
                description = `${transaction.description} (${i + 1}/${count})`;
            }

            const saved = await prisma.transaction.create({
                data: {
                    description: description,
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    date: currentDate,
                }
            });
            if (i === 0) savedId = saved.id;
        }

        let replyText = `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`;

        if (count > 1) {
            replyText += `\n🔄 Repetição: ${count} meses${isInstallment ? ' (Parcelado)' : ''}`;
        }

        await sendWhatsAppReply(remoteJid, replyText);

        return NextResponse.json({ success: true, savedId: savedId });

    } catch (error) {
        console.error("❌ ERRO WEBHOOK:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// NOVO HELPER PARA UAZAPI (Baixar Mídia via API - v2 Payload Corrected + Message Fetch Strategy)
async function fetchBase64FromUAZAPI(messageObject: any): Promise<string | null> {
    try {
        console.log("⬇️ Solicitando Base64 para a UAZAPI (Modo Detetive)...");

        let apiUrl = process.env.UAZAPI_URL;
        const apiKey = process.env.UAZAPI_API_KEY;
        if (!apiUrl || !apiKey) return null;

        let baseUrl = "";
        let instance = "";
        try {
            const urlObj = new URL(apiUrl);
            baseUrl = `${urlObj.protocol}//${urlObj.host}`;
            const parts = urlObj.pathname.split('/').filter(p => p);
            instance = parts[parts.length - 1]; // ex: sistema
        } catch {
            return null;
        }

        const headers: any = {
            'Content-Type': 'application/json',
            'apikey': apiKey,
            'ApiKey': apiKey,
            'Authorization': `Bearer ${apiKey}`
        };

        const messageId = messageObject.key?.id || messageObject.id || messageObject.messageId;

        // 1. Tentar recuperar mensagem original
        let messageToDownload = messageObject;
        console.log(`🔎 Buscando mensagem original (ID: ${messageId})...`);

        const findUrl = `${baseUrl}/chat/findMessage/${instance}`;
        try {
            const resFind = await fetch(findUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ where: { id: messageId } })
            });

            if (resFind.ok) {
                const foundData = await resFind.json();
                const msgData = Array.isArray(foundData) ? foundData[0] : foundData;
                if (msgData) {
                    console.log("✅ Mensagem recuperada! Tem mediaKey? " + (JSON.stringify(msgData).includes('mediaKey')));
                    messageToDownload = msgData;
                }
            } else {
                console.log(`⚠️ Falha FindMessage (${resFind.status}): ${await resFind.text()}`);
            }
        } catch (e) {
            console.log("⚠️ Erro FindMessage (Exception):", e);
        }

        // 2. Tentar Download (POST)
        const payloadFull = {
            message: messageToDownload,
            convertToMp4: false
        };

        const candidates = [
            `${baseUrl}/chat/getBase64FromMediaMessage/${instance}`,
            `${baseUrl}/message/getBase64FromMediaMessage/${instance}`,
            `${baseUrl}/message/download/${instance}`
        ];

        for (const url of candidates) {
            try {
                console.log(`📡 POST ${url}`);
                const res = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payloadFull)
                });

                if (res.ok) {
                    const data = await res.json();
                    const b64 = data.base64 || data.base64Data || data;
                    if (typeof b64 === 'string' && b64.length > 50) return b64;
                } else {
                    console.log(`⚠️ Falha POST (${res.status}): ${await res.text()}`);
                }
            } catch (e) { console.error(`Erro Exception POST ${url}:`, e); }
        }

        console.error("❌ Todas as tentativas falharam.");
        return null;

    } catch (e) {
        return null;
    }
}

async function sendWhatsAppReply(to: string, text: string) {
    let apiUrl = process.env.UAZAPI_URL;
    const apiKey = process.env.UAZAPI_API_KEY;

    if (!apiUrl || !apiKey) return;

    let baseUrl = "";
    let instance = "";

    try {
        const urlObj = new URL(apiUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const parts = urlObj.pathname.split('/').filter(p => p);
        instance = parts[parts.length - 1];
    } catch (e) {
        baseUrl = apiUrl;
    }

    const headers: any = {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'ApiKey': apiKey
    };

    const endpointsTrying = [
        apiUrl,
        `${baseUrl}/message/sendText/${instance}`,
        `${baseUrl}/message/text/${instance}`
    ];

    const uniqueEndpoints = endpointsTrying.filter((value, index, self) => self.indexOf(value) === index);

    const payload = {
        number: String(to).replace('@s.whatsapp.net', ''),
        text: text,
        delay: 1000
    };

    for (const url of uniqueEndpoints) {
        try {
            await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
        } catch (e) { /* silent */ }
    }
}
