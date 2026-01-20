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
        console.log("📦 [DEBUG] msgObject Encontrado:", JSON.stringify(msgObject).substring(0, 500));
        // --------------------

        // Extrair quem mandou (Ajustado para log do usuário: 'sender')
        const remoteJid = msgObject.sender ||
            msgObject.key?.remoteJid ||
            msgObject.from ||
            msgObject.remoteJid ||
            msgObject.chatid ||
            "";

        const isFromMe = msgObject.key?.fromMe || msgObject.fromMe || false;

        console.log(`👤 Remetente: "${remoteJid}" (Sou eu? ${isFromMe})`);

        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Validação de segurança
        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');

            // Verifica se contém o número
            if (!cleanRemote.includes(cleanMyNumber)) {
                console.log(`⛔ Bloqueado: Recebido de ${cleanRemote}. Autorizado apenas: ${cleanMyNumber}`);
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // Extrair texto (Ajustado para log do usuário: 'text' ou 'content')
        const messageContent = msgObject.message || msgObject;
        const text = messageContent.text ||
            messageContent.content ||
            messageContent.conversation ||
            messageContent.extendedTextMessage?.text ||
            messageContent.textMessage?.text ||
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
    let apiUrl = process.env.UAZAPI_URL;
    const apiKey = process.env.UAZAPI_API_KEY;

    if (!apiUrl || !apiKey) {
        console.error("⚠️ Variaveis UAZAPI faltando.");
        return;
    }

    // Tentar limpar a URL para pegar a base e a instância
    // Ex: https://bemquerer.uazapi.com/message/sendText/sistema -> Base: ...uazapi.com, Instance: sistema
    let baseUrl = "";
    let instance = "";

    try {
        const urlObj = new URL(apiUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const parts = urlObj.pathname.split('/').filter(p => p);
        instance = parts[parts.length - 1]; // pega o último pedaço
    } catch (e) {
        console.error("Erro ao parsear URL UAZAPI:", e);
        // Fallback: usa a url original
        baseUrl = apiUrl;
    }

    // Lista de endpoints para tentar (Fallback Strategy)
    const endpointsTrying = [
        apiUrl, // Tenta a configurada primeiro
        `${baseUrl}/message/sendText/${instance}`, // v2 padrão
        `${baseUrl}/message/text/${instance}`,     // v1 padrão
        `${baseUrl}/chat/sendText/${instance}`     // Forks
    ];

    // Remove duplicatas
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

            // Tenta primeiro com payload V2
            let res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                body: JSON.stringify(payloadV2)
            });

            if (res.status === 405 || res.status === 404) {
                // Se falhar com 405/404, tenta payload V1 nesse mesmo endpoint (algumas versoes mudam o body)
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
                return; // Parar tentativas
            } else {
                console.log(`❌ Falha em ${url}: ${res.status} - ${responseText}`);
            }
        } catch (e) {
            console.error(`❌ Erro de conexão em ${url}:`, e);
        }
    }
    console.error("🏁 Todas as tentativas de envio falharam.");
}
