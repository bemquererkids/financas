import { NextResponse } from 'next/server';
import { parseTransactionCheck } from '@/lib/nlp'; // Removido media handlers pois servidor não suporta
import { prisma } from '@/lib/prisma';

// Configurações
const MY_PHONE_NUMBER = process.env.MY_WHATSAPP_NUMBER;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Evita processar eventos de presença (digitando...)
        const eventType = body.EventType || body.type || 'unknown';
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
            return NextResponse.json({ status: 'unknown_structure' });
        }

        // Extrair Remetente
        const remoteJid = msgObject.sender ||
            msgObject.key?.remoteJid ||
            msgObject.from ||
            msgObject.remoteJid ||
            "";

        const isFromMe = msgObject.key?.fromMe || msgObject.fromMe || false;

        // Ignora mensagens enviadas por mim mesmo (para não entrar em loop)
        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Segurança: Valida número autorizado
        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');
            if (!cleanRemote.includes(cleanMyNumber)) {
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // --- PROCESSAMENTO ---
        const messageInfo = msgObject.message || msgObject;
        const contentObj = (typeof msgObject.content === 'object' && msgObject.content !== null) ? msgObject.content : {};

        // Detectar Tipo de Mídia (para dar feedback rápido)
        const isAudio = messageInfo.audioMessage || msgObject.mediaType === 'ptt' || (contentObj.mimetype && contentObj.mimetype.includes('audio'));
        const isImage = messageInfo.imageMessage || msgObject.mediaType === 'image' || (contentObj.mimetype && contentObj.mimetype.includes('image'));

        // SE FOR MÍDIA: Avisar limitação do servidor e parar
        if (isAudio || isImage) {
            console.log("⚠️ Mídia detectada, mas download desabilitado devido a erro 405 do servidor UAZAPI.");

            // Tenta pegar thumbnail da imagem se existir (melhor que nada)
            // Futuramente poderia tentar OCR no thumbnail, mas a resolução é muito baixa (32x32px geralmente)

            await sendWhatsAppReply(remoteJid, "⚠️ O servidor de WhatsApp atual não permite download de áudio/imagem. Por favor, escreva os dados (ex: 'Almoço 50').");
            return NextResponse.json({ status: 'media_not_supported_by_server' });
        }

        // SE FOR TEXTO: Processar com IA
        const textFromContent = (typeof msgObject.content === 'string') ? msgObject.content : (msgObject.content?.text || msgObject.content?.caption || "");
        const text = messageInfo.text ||
            textFromContent ||
            messageInfo.conversation ||
            messageInfo.extendedTextMessage?.text ||
            messageInfo.textMessage?.text ||
            messageInfo.body || "";

        const cleanText = (typeof text === 'object') ? JSON.stringify(text) : text;

        if (!cleanText || cleanText.length < 2 || cleanText.includes("[object Object]")) {
            return NextResponse.json({ status: 'no_text_content' });
        }

        console.log(`📝 Processando Texto: "${cleanText}"`);

        // Cérebro: Analisar intenção (Gasto, Receita, Recorrência)
        const transaction = await parseTransactionCheck(cleanText);

        if (!transaction || !transaction.found) {
            // Opcional: Feedback de "não entendi" (comentado para evitar chatice)
            // await sendWhatsAppReply(remoteJid, "❓ Não entendi. Tente: 'Mercado 200' ou 'Salário 5000 todo mês'.");
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // Executar Ação no Banco de Dados
        const recurrence = transaction.recurrence;
        const count = recurrence?.count || 1;
        const isInstallment = recurrence?.isInstallment || false;

        console.log(`💾 Salvando ${count}x ${transaction.type} de R$ ${transaction.amount}...`);

        const baseDate = new Date(transaction.date);
        let firstId = "";

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
            if (i === 0) firstId = saved.id;
        }

        // Feedback de Sucesso
        let replyText = `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`;

        if (count > 1) {
            replyText += `\n🔄 Repetição: ${count} meses${isInstallment ? ' (Parcelado)' : ''}`;
        }

        await sendWhatsAppReply(remoteJid, replyText);

        return NextResponse.json({ success: true, savedId: firstId });

    } catch (error) {
        console.error("❌ ERRO WEBHOOK:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// Helper Simples de Envio (Sem download)
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
        delay: 500
    };

    for (const url of uniqueEndpoints) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (res.ok) return;
        } catch (e) { /* silent */ }
    }
}
