import { NextResponse } from 'next/server';
import { parseTransactionCheck } from '@/lib/nlp';
import { prisma } from '@/lib/prisma';

// Configurações (idealmente viriam do .env)
const MY_PHONE_NUMBER = process.env.MY_WHATSAPP_NUMBER; // ex: 5511999998888@s.whatsapp.net
// Se não tiver config, aceita qualquer um por enquanto (cuidado em prod!)

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Webhook recebido:", JSON.stringify(body, null, 2));

        // Adaptação para estrutura comum de APIs tipo Base/Evolution/UAZAPI
        // Geralmente vem em body.message ou body.data.message
        // Ajuste conforme o JSON real da sua versão da UAZAPI

        const messageData = body.message || body.data?.message || body;

        // Extrair quem mandou
        const remoteJid = messageData.key?.remoteJid || messageData.from;
        const isFromMe = messageData.key?.fromMe || false;

        // Ignora mensagens enviadas por mim mesmo (loop) ou de grupos, se quiser
        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Segurança básica: Só processa se for do meu número
        if (MY_PHONE_NUMBER && !remoteJid.includes(MY_PHONE_NUMBER)) {
            console.log(`Mensagem ignorada de ${remoteJid} (Não autorizado)`);
            return NextResponse.json({ status: 'ignored_unauthorized' });
        }

        // Extrair texto
        const text = messageData.conversation ||
            messageData.extendedTextMessage?.text ||
            messageData.body ||
            "";

        if (!text) return NextResponse.json({ status: 'no_text' });

        // 1. Inteligência Artificial processa o texto
        const transaction = await parseTransactionCheck(text);

        if (!transaction || !transaction.found) {
            // Não parecia uma transação, ignora e não responde nada (pra não ser chato)
            return NextResponse.json({ status: 'no_transaction_intent' });
        }

        // 2. Salva no banco
        const saved = await prisma.transaction.create({
            data: {
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                // Associa a um usuário padrão (admin) ou tenta achar pelo telefone no futuro
                // Por enquando, null no usuario se schema nao exigir, ou hack do "default"
            }
        });

        // 3. Responde via API da UAZAPI
        // Precisa configurar URL e Key
        await sendWhatsAppReply(remoteJid, `✅ *Lançamento Registrado!*
💰 ${transaction.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${transaction.amount.toFixed(2)}
🏷️ ${transaction.category}
📝 ${transaction.description}`);

        return NextResponse.json({ success: true, savedId: saved.id });

    } catch (error) {
        console.error("Erro no webhook:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

async function sendWhatsAppReply(to: string, text: string) {
    const apiUrl = process.env.UAZAPI_URL; // ex: https://server.uazapi.com/message/sendText/INSTANCE
    const apiKey = process.env.UAZAPI_API_KEY;

    if (!apiUrl || !apiKey) {
        console.warn("UAZAPI variables not set. Cannot reply.");
        return;
    }

    try {
        await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: to.replace('@s.whatsapp.net', ''), // Algumas APIs pedem só numero
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                textMessage: {
                    text: text
                }
            })
        });
    } catch (e) {
        console.error("Falha ao responder WhatsApp:", e);
    }
}
