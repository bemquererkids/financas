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

        // --- RAIO-X DEBUG ---
        console.log("📦 [DEBUG] msgObject:", JSON.stringify(msgObject).substring(0, 400));
        // --------------------

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
                console.log(`⛔ Bloqueado: Recebido de ${cleanRemote}. Autorizado apenas: ${cleanMyNumber}`);
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // ---PROCESSAMENTO---
        const messageInfo = msgObject.message || msgObject;
        const contentObj = (typeof msgObject.content === 'object' && msgObject.content !== null) ? msgObject.content : {};

        let transaction = null;

        // 1. ÁUDIO
        const isAudio = messageInfo.audioMessage ||
            msgObject.messageType === 'audioMessage' ||
            msgObject.type === 'audio' ||
            msgObject.mediaType === 'ptt' || // Audio PTT do payload UAZAPI
            (contentObj.mimetype && contentObj.mimetype.includes('audio'));

        if (isAudio) {
            console.log("🎤 Áudio detectado! Buscando Base64...");
            let base64Audio = null;

            if (msgObject.base64 || contentObj.base64) {
                base64Audio = msgObject.base64 || contentObj.base64;
            } else {
                // Tenta buscar via API com estratégia robusta
                base64Audio = await fetchBase64FromUAZAPI(msgObject);
            }

            if (base64Audio) {
                const transcription = await transcribeAudioMessage(base64Audio);
                console.log(`🎤 Transcrição: "${transcription}"`);
                if (transcription) {
                    transaction = await parseTransactionCheck(transcription);
                }
            } else {
                console.log("⚠️ Falha ao obter Base64 do áudio.");
                await sendWhatsAppReply(remoteJid, "⚠️ Recebi seu áudio, mas ocorreu um erro no download. Tente enviar novamente.");
            }
        }

        // 2. IMAGEM
        else if (messageInfo.imageMessage ||
            msgObject.messageType === 'imageMessage' ||
            msgObject.type === 'image' ||
            (contentObj.mimetype && contentObj.mimetype.includes('image'))) {

            console.log("📸 Imagem detectada! Buscando Base64...");
            let base64Image = null;

            if (msgObject.base64 || contentObj.base64) {
                base64Image = msgObject.base64 || contentObj.base64;
            } else {
                base64Image = await fetchBase64FromUAZAPI(msgObject);
            }

            // Fallback: Tenta usar o Thumbnail se o download falhou
            if (!base64Image) {
                const thumb = messageInfo.imageMessage?.JPEGThumbnail ||
                    msgObject.JPEGThumbnail ||
                    contentObj.JPEGThumbnail;

                if (thumb) {
                    console.log("⚠️ Download Full HD falhou. Usando Thumbnail (Baixa Resolução) como fallback.");
                    base64Image = thumb;
                }
            }

            if (base64Image) {
                transaction = await analyzeImageTransaction(base64Image);
            } else {
                console.log("⚠️ Falha ao obter Base64 da imagem (nem thumbnail disponível).");
                await sendWhatsAppReply(remoteJid, "⚠️ Recebi a imagem, mas não consegui baixar. Tente enviar novamente.");
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

            if (cleanText && cleanText !== "{}" && !cleanText.includes("[object Object]")) {
                transaction = await parseTransactionCheck(cleanText);
            }
        }

        if (!transaction || !transaction.found) {
            console.log("🤷‍♂️ Nenhuma transação identificada.");
            // Só envia feedback se não for mídia que falhou o download (já avisado acima)
            if (!isAudio && !(messageInfo.imageMessage)) {
                await sendWhatsAppReply(remoteJid, "❌ Não consegui identificar transação. Tente: 'Almoço 50' ou envie um áudio/foto.");
            }
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // Lógica de Salvamento com Suporte a Recorrência
        const recurrence = transaction.recurrence;
        const count = recurrence?.count || 1;
        const isInstallment = recurrence?.isInstallment || false;

        console.log(`💾 Salvando ${count}x ${transaction.type} de R$ ${transaction.amount}...`);

        let savedId = "";
        const baseDate = new Date(transaction.date);

        for (let i = 0; i < count; i++) {
            // Calcular Data: Soma 'i' meses à data base
            const currentDate = new Date(baseDate);
            currentDate.setMonth(baseDate.getMonth() + i);

            // Ajustar Descrição para parcelas (ex: "Compra (1/3)")
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

        console.log(`✅ Salvo(s) ${count} registro(s). ID Inicial: ${savedId}`);

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
        console.log("⬇️ Solicitando Base64 para a UAZAPI (Estratégia Anti-405)...");

        let apiUrl = process.env.UAZAPI_URL;
        const apiKey = process.env.UAZAPI_API_KEY;
        if (!apiUrl || !apiKey) return null;

        // Normalização da URL
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

        // Headers Robustos (Envia todas as variações conhecidas)
        const headers: any = {
            'Content-Type': 'application/json',
            'apikey': apiKey,
            'ApiKey': apiKey,
            'Authorization': `Bearer ${apiKey}`
        };

        const messageId = messageObject.key?.id || messageObject.id || messageObject.messageId;
        if (!messageId) {
            console.error("❌ ID da mensagem não encontrado.");
            return null;
        }

        // Tenta recuperar a mensagem original do banco da API primeiro
        // Isso é crucial porque o webhook as vezes vem num formato diferente do que o endpoint de download precisa
        let messageToDownload = messageObject;

        console.log(`🔎 Tentando recuperar mensagem original (ID: ${messageId})...`);
        const findEndpoints = [
            `${baseUrl}/chat/findMessage/${instance}`,
            `${baseUrl}/message/find/${instance}`
        ];

        for (const findUrl of findEndpoints) {
            try {
                const resFind = await fetch(findUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ where: { id: messageId } })
                });

                if (resFind.ok) {
                    const foundData = await resFind.json();
                    // UAZAPI / Evolution às vezes retorna array ou objeto direto
                    const msgData = Array.isArray(foundData) ? foundData[0] : foundData;

                    if (msgData && (msgData.key || msgData.id)) {
                        console.log("✅ Mensagem original recuperada com sucesso!");
                        messageToDownload = msgData;
                        break;
                    }
                }
            } catch (e) { /* ignore */ }
        }


        // Payload para Download
        // As versões mais recentes da Evolution preferem { message: fullMessageObject }
        // Se falhar o objeto full, tenta só o ID se existir endpoint pra isso
        const payloadFull = {
            message: messageToDownload,
            convertToMp4: false
        };

        const candidates = [
            `${baseUrl}/chat/getBase64FromMediaMessage/${instance}`, // Preferencial
            `${baseUrl}/message/getBase64FromMediaMessage/${instance}`,
            `${baseUrl}/message/download/${instance}`
        ];

        for (const url of candidates) {
            try {
                console.log(`📡 Tentando baixar de: ${url}`);
                const res = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payloadFull)
                });

                if (res.ok) {
                    const data = await res.json();
                    const b64 = data.base64 || data.base64Data || data;

                    if (typeof b64 === 'string' && b64.length > 50) {
                        console.log("✅ Download Concluído!");
                        return b64;
                    }
                } else {
                    console.log(`⚠️ Falha (${res.status} - ${res.statusText}) em ${url}`);
                }
            } catch (e) {
                console.error(`Erro conexão ${url}:`, e);
            }
        }

        console.error("❌ Todas as tentativas de download de mídia falharam.");
        return null;

    } catch (e) {
        console.error("Erro fetchBase64FromUAZAPI:", e);
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
        `${baseUrl}/message/text/${instance}`,
        `${baseUrl}/chat/sendText/${instance}`
    ];

    const uniqueEndpoints = endpointsTrying.filter((value, index, self) => self.indexOf(value) === index);

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
            let res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payloadV2)
            });

            if (res.status === 405 || res.status === 404) {
                res = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payloadV1)
                });
            }
            if (res.ok) return;
        } catch (e) {
            console.error(`Erro envio em ${url}:`, e);
        }
    }
}
