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
            (contentObj.mimetype && contentObj.mimetype.includes('audio'));

        if (isAudio) {
            console.log("🎤 Áudio detectado! Buscando Base64...");
            let base64Audio = null;

            if (msgObject.base64 || contentObj.base64) {
                base64Audio = msgObject.base64 || contentObj.base64;
            } else {
                // Tenta buscar via API
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
            // O thumbnail geralmente vem em messageInfo.imageMessage.JPEGThumbnail ou content.JPEGThumbnail
            if (!base64Image) {
                const thumb = messageInfo.imageMessage?.JPEGThumbnail ||
                    msgObject.JPEGThumbnail ||
                    contentObj.JPEGThumbnail; // <--- Bingo!

                if (thumb) {
                    console.log("⚠️ Download Full HD falhou. Usando Thumbnail (Baixa Resolução) como fallback.");
                    base64Image = thumb;
                }
            }

            if (base64Image) {
                transaction = await analyzeImageTransaction(base64Image);
            } else {
                console.log("⚠️ Falha ao obter Base64 da imagem (nem thumbnail disponível).");
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
            // Feedback de erro para o usuário
            await sendWhatsAppReply(remoteJid, "❌ Não consegui identificar os dados da transação (valor, descrição). Tente digitar ou mandar um áudio mais claro.\nEx: 'Almoço 50'");
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
            // Se for recorrência mensal sem ser parcela (ex: "Salário"), mantém descrição limpa ou adiciona mês opcionalmente
            // Optei por manter limpa para agrupar melhor, mas a data será diferente.

            const saved = await prisma.transaction.create({
                data: {
                    description: description,
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    date: currentDate,
                }
            });

            if (i === 0) savedId = saved.id; // Guarda o primeiro ID para retorno/log
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

// NOVO HELPER PARA UAZAPI (Baixar Mídia via API - v2 Payload Corrected)
async function fetchBase64FromUAZAPI(messageObject: any): Promise<string | null> {
    try {
        console.log("⬇️ Solicitando Base64 para a UAZAPI...");

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

        // Recuperar ID da mensagem corretamente
        const messageId = messageObject.key?.id || messageObject.id || messageObject.messageId;

        if (!messageId) {
            console.error("❌ Não foi possível encontrar o ID da mensagem para download.");
            return null;
        }

        // Payload correto conforme Documentação Oficial UAZAPI / Evolution v2
        const validPayload = {
            id: messageId,
            return_base64: true,
            generate_mp3: true,   // Garante formato comum para áudio
            return_link: false
        };

        // Lista de endpoints prioritários
        // A doc diz /message/download (que vira /message/download/{instance} no SaaS)
        const candidates = [
            `${baseUrl}/message/download/${instance}`,
            `${baseUrl}/message/base64/${instance}`,
            `${baseUrl}/chat/getBase64FromMediaMessage/${instance}`
        ];

        for (const url of candidates) {
            try {
                console.log(`📡 Tentando baixar de: ${url} (ID: ${messageId})`);

                // Tenta payload v2 (só ID)
                let res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': apiKey
                    },
                    body: JSON.stringify(validPayload)
                });

                // Se der erro 400/405/404, tenta payload antigo (objeto completo) só por garantia para endpoints legados
                if (!res.ok && (res.status === 400 || res.status === 404)) {
                    console.log(`⚠️ Falha v2 (${res.status}). Tentando payload legacy...`);
                    res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                        body: JSON.stringify({ message: messageObject, convertToMp4: false })
                    });
                }

                if (res.ok) {
                    const data = await res.json();

                    // UAZAPI pode retornar: { base64Data: "..." } ou { base64: "..." } ou string direta
                    const b64 = data.base64Data || data.base64 || data;

                    if (typeof b64 === 'string' && b64.length > 50) {
                        return b64;
                    }
                } else {
                    console.log(`⚠️ Falha (${res.status}) em ${url}`);
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

    const endpointsTrying = [
        apiUrl,
        `${baseUrl}/message/sendText/${instance}`,
        `${baseUrl}/message/text/${instance}`,
        `${baseUrl}/chat/sendText/${instance}`
    ];

    // Filtra duplicados
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
                headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                body: JSON.stringify(payloadV2)
            });

            if (res.status === 405 || res.status === 404) {
                res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                    body: JSON.stringify(payloadV1)
                });
            }
            if (res.ok) return;
        } catch (e) {
            console.error(`Erro envio em ${url}:`, e);
        }
    }
}
