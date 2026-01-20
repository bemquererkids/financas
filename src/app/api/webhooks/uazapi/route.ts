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
            console.log("❌ Estrutura msgObject não encontrada. Keys:", Object.keys(body));
            return NextResponse.json({ status: 'unknown_structure', keys: Object.keys(body) });
        }

        // --- RAIO-X DEBUG ---
        console.log("📦 [DEBUG] msgObject:", JSON.stringify(msgObject).substring(0, 400));
        // --------------------

        // Extrair quem mandou
        const remoteJid = msgObject.sender ||
            msgObject.key?.remoteJid ||
            msgObject.from ||
            msgObject.remoteJid ||
            msgObject.chatid || "";

        const isFromMe = msgObject.key?.fromMe || msgObject.fromMe || false;

        console.log(`👤 Remetente: "${remoteJid}" (Sou eu? ${isFromMe})`);

        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Validação de segurança
        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');
            if (!cleanRemote.includes(cleanMyNumber)) {
                console.log(`⛔ Bloqueado: Recebido de ${cleanRemote}. Autorizado apenas: ${cleanMyNumber}`);
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // ---PROCESSAMENTO DE MÍDIA E TEXTO---
        const messageInfo = msgObject.message || msgObject;

        // Verifica se 'content' é um objeto (estrutura rica da UAZAPI)
        const contentObj = (typeof msgObject.content === 'object' && msgObject.content !== null) ? msgObject.content : {};

        let transaction = null;

        // 1. É Áudio?
        const isAudio = messageInfo.audioMessage ||
            msgObject.messageType === 'audioMessage' ||
            msgObject.type === 'audio' ||
            (contentObj.mimetype && contentObj.mimetype.includes('audio'));

        if (isAudio) {
            console.log("🎤 Áudio detectado! Baixando e transcrevendo...");
            const mediaUrl = messageInfo.audioMessage?.url ||
                msgObject.mediaUrl ||
                msgObject.url ||
                contentObj.URL; // UAZAPI URL no content

            let base64Audio = null;

            if (mediaUrl) {
                base64Audio = await downloadMediaAsBase64(mediaUrl);
            } else if (msgObject.base64 || contentObj.base64) {
                base64Audio = msgObject.base64 || contentObj.base64;
            }

            if (base64Audio) {
                const transcription = await transcribeAudioMessage(base64Audio);
                console.log(`🎤 Transcrição: "${transcription}"`);
                if (transcription) {
                    transaction = await parseTransactionCheck(transcription);
                }
            } else {
                console.log("⚠️ URL de áudio não encontrada ou vazia.");
            }
        }

        // 2. É Imagem?
        else if (messageInfo.imageMessage ||
            msgObject.messageType === 'imageMessage' ||
            msgObject.type === 'image' ||
            (contentObj.mimetype && contentObj.mimetype.includes('image'))) {

            console.log("📸 Imagem detectada! Analisando Recibo/Nota...");
            const mediaUrl = messageInfo.imageMessage?.url ||
                msgObject.mediaUrl ||
                msgObject.url ||
                contentObj.URL;

            let base64Image = null;

            if (mediaUrl) {
                base64Image = await downloadMediaAsBase64(mediaUrl);
            } else if (msgObject.base64 || contentObj.base64) {
                base64Image = msgObject.base64 || contentObj.base64;
            }

            if (base64Image) {
                transaction = await analyzeImageTransaction(base64Image);
            } else {
                console.log("⚠️ URL de imagem não encontrada.");
            }
        }

        // 3. É Texto? (Fallback)
        else {
            // Se content for objeto e não caiu nas mídias acima, tenta pegar caption ou text dele
            const textFromContent = (typeof msgObject.content === 'string') ? msgObject.content : (msgObject.content?.text || msgObject.content?.caption || "");

            const text = messageInfo.text ||
                textFromContent ||
                messageInfo.content ||
                messageInfo.conversation ||
                messageInfo.extendedTextMessage?.text ||
                messageInfo.textMessage?.text ||
                messageInfo.body || "";

            // Filtra [object Object] pra logar bonito
            const cleanText = (typeof text === 'object') ? JSON.stringify(text) : text;
            console.log(`📝 Texto: "${cleanText}"`);

            if (cleanText && cleanText !== "{}" && !cleanText.includes("[object Object]")) {
                transaction = await parseTransactionCheck(cleanText);
            }
        }

        // Conclusão
        if (!transaction || !transaction.found) {
            console.log("🤷‍♂️ Nenhuma transação identificada na mensagem.");
            // Não retorna erro, só ignora
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // Salvar
        console.log(`💾 Salvando ${transaction.type} de R$ ${transaction.amount}...`);
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

        // Resposta
        const replyText = `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`;

        await sendWhatsAppReply(remoteJid, replyText);

        return NextResponse.json({ success: true, savedId: saved.id });

    } catch (error) {
        console.error("❌ ERRO WEBHOOK:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// Helper para baixar mídia de URL pública (caso a UAZAPI mande URL)
async function downloadMediaAsBase64(url: string): Promise<string | null> {
    try {
        console.log("⬇️ Baixando mídia de:", url);
        // Nota: A URL da UAZAPI pode exigir headers/auth se não for pública
        // Para mídia CDN do Whatsapp geralmente não precisa auth extra se a URL for temporária
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (e) {
        console.error("Erro download mídia:", e);
        return null;
    }
}

async function sendWhatsAppReply(to: string, text: string) {
    let apiUrl = process.env.UAZAPI_URL;
    const apiKey = process.env.UAZAPI_API_KEY;

    if (!apiUrl || !apiKey) {
        console.error("⚠️ Variaveis UAZAPI faltando.");
        return;
    }

    let baseUrl = "";
    let instance = "";

    try {
        const urlObj = new URL(apiUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const parts = urlObj.pathname.split('/').filter(p => p);
        instance = parts[parts.length - 1]; // pega o último pedaço
    } catch (e) {
        console.error("Erro ao parsear URL UAZAPI:", e);
        baseUrl = apiUrl;
    }

    // Lista de endpoints para tentar (Fallback Strategy)
    const endpointsTrying = [
        apiUrl,
        `${baseUrl}/message/sendText/${instance}`,
        `${baseUrl}/message/text/${instance}`,
        `${baseUrl}/chat/sendText/${instance}`
    ];

    const uniqueEndpoints = endpointsTrying.filter((value, index, self) => self.indexOf(value) === index);

    console.log(`🚀 Iniciando tentativa de envio. Endpoints candidatos: ${uniqueEndpoints.length}`);

    const payloadV2 = {
        number: String(to).replace('@s.whatsapp.net', ''),
        textMessage: { text: text },
        options: { delay: 1000, presence: 'composing' }
    };

    const payloadV1 = {
        number: String(to).replace('@s.whatsapp.net', ''),
        text: text,
        delay: 1000
    };

    for (const url of uniqueEndpoints) {
        try {
            console.log(`👉 Tentando: ${url}`);

            let res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                body: JSON.stringify(payloadV2)
            });

            if (res.status === 405 || res.status === 404) {
                console.log(`⚠️ Falha v2 (${res.status}). Tentando payload v1...`);
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                    body: JSON.stringify(payloadV1)
                });
            }

            const responseText = await res.text();

            if (res.ok) {
                console.log(`✅ SUCESSO! Mensagem enviada via ${url}`);
                return;
            } else {
                console.log(`❌ Falha em ${url}: ${res.status} - ${responseText}`);
            }
        } catch (e) {
            console.error(`❌ Erro de conexão em ${url}:`, e);
        }
    }
    console.error("🏁 Todas as tentativas de envio falharam.");
}
