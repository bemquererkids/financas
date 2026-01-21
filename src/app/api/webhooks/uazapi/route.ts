import { NextResponse } from 'next/server';
import { processIntent } from '@/lib/nlp';
import { prisma } from '@/lib/prisma';

// Configurações
const MY_PHONE_NUMBER = process.env.MY_WHATSAPP_NUMBER;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Evita processar eventos de presença
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
        if (isFromMe) return NextResponse.json({ status: 'ignored_self' });

        // Segurança
        if (MY_PHONE_NUMBER && remoteJid) {
            const cleanRemote = String(remoteJid).replace(/\D/g, '');
            const cleanMyNumber = String(MY_PHONE_NUMBER).replace(/\D/g, '');
            if (!cleanRemote.includes(cleanMyNumber)) {
                return NextResponse.json({ status: 'ignored_unauthorized' });
            }
        }

        // --- PROCESSAMENTO PRINCIPAL ---
        const messageInfo = msgObject.message || msgObject;
        const contentObj = (typeof msgObject.content === 'object' && msgObject.content !== null) ? msgObject.content : {};

        let textToAnalyze = "";

        // 1. Áudio / Imagem -> Detectar e Avisar (Limitação 405) ou Tentar (se texto vier junto)
        const isAudio = messageInfo.audioMessage || msgObject.mediaType === 'ptt' || (contentObj.mimetype && contentObj.mimetype.includes('audio'));
        const isImage = messageInfo.imageMessage || msgObject.mediaType === 'image' || (contentObj.mimetype && contentObj.mimetype.includes('image'));

        if (isAudio || isImage) {
            await sendWhatsAppReply(remoteJid, "⚠️ Servidor não permite download de mídia. Por favor, envie como texto.");
            return NextResponse.json({ status: 'media_blocked' });
        }

        // 2. Extrair Texto
        const textFromContent = (typeof msgObject.content === 'string') ? msgObject.content : (msgObject.content?.text || msgObject.content?.caption || "");
        textToAnalyze = messageInfo.text ||
            textFromContent ||
            messageInfo.conversation ||
            messageInfo.extendedTextMessage?.text ||
            messageInfo.textMessage?.text ||
            messageInfo.body || "";

        const cleanText = (typeof textToAnalyze === 'object') ? JSON.stringify(textToAnalyze) : textToAnalyze;

        if (!cleanText || cleanText.length < 2 || cleanText.includes("[object Object]")) {
            return NextResponse.json({ status: 'no_text_content' });
        }

        console.log(`📝 Texto Recebido: "${cleanText}"`);

        // BUSCA USUÁRIO FALLBACK (Para webhook funcionar em single-tenant por enquanto)
        // TODO: Implementar mapeamento Telefone -> UserID
        const fallbackUser = await prisma.user.findFirst();
        if (!fallbackUser) {
            console.error("❌ Nenhum usuário encontrado para vincular ao Webhook.");
            return NextResponse.json({ status: 'no_user_found' });
        }
        const userId = fallbackUser.id;

        // --- CÉREBRO NLP ---
        const result = await processIntent(cleanText);

        // FALLBACK INTELIGENTE (Substitui Chatbot Externo)
        if (!result || !result.found || !result.data) {
            const helpText = `🤔 *Não entendi bem.*
Tente estes formatos:

💸 *Gastos:* "Mercado 200", "Salário 5000"
🎯 *Metas:* "Nova meta Viagem 10k"
🧾 *Boletos:* "Luz vence dia 10 valor 150"
📈 *Investir:* "Simular CDB 500 reais"
📊 *Planejar:* "Planejar 500 pra Lazer"`;

            await sendWhatsAppReply(remoteJid, helpText);
            return NextResponse.json({ status: 'intent_unknown' });
        }

        console.log(`🧠 Intenção Detectada: ${result.intent}`);
        let replyText = "";
        let savedId = "";

        // --- ROTEAMENTO POR INTENÇÃO ---
        switch (result.intent) {
            case 'TRANSACTION': {
                const data = result.data as any; // Cast seguro pois nlp garante estrutura
                const count = data.recurrence?.count || 1;
                const isInstallment = data.recurrence?.isInstallment || false;
                const baseDate = new Date(data.date || new Date());

                for (let i = 0; i < count; i++) {
                    const currentDate = new Date(baseDate);
                    currentDate.setMonth(baseDate.getMonth() + i);

                    let description = data.description;
                    if (isInstallment && count > 1) {
                        description = `${data.description} (${i + 1}/${count})`;
                    }

                    const tx = await prisma.transaction.create({
                        data: {
                            description,
                            amount: data.amount,
                            type: data.type,
                            category: data.category || 'Outros',
                            date: currentDate,
                            userId
                        }
                    });
                    if (i === 0) savedId = tx.id;
                }

                replyText = `✅ *Transação Registrada!*
💰 ${data.type === 'EXPENSE' ? 'Despesa' : 'Receita'}: R$ ${data.amount}
🏷️ ${data.category}
📝 ${data.description}`;
                if (count > 1) replyText += `\n🔄 Repetição: ${count}x`;
                break;
            }

            case 'GOAL': {
                const data = result.data as any;
                const goal = await prisma.goal.create({
                    data: {
                        description: data.description,
                        targetAmount: data.targetAmount || 0,
                        status: 'PENDING',
                        userId
                    }
                });
                savedId = goal.id;
                replyText = `🎯 *Nova Meta Criada!*
📌 ${data.description}
🎯 Meta: R$ ${data.targetAmount || 'Indefinido'}
📅 Prazo: ${data.deadline ? new Date(data.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}`;
                break;
            }

            case 'INVESTMENT': {
                const data = result.data as any;
                // Cria uma simulação simples
                const inv = await prisma.investmentProjection.create({
                    data: {
                        name: data.description || "Simulação Rápida",
                        initialBalance: data.amount,
                        monthlyContribution: 0, // Default simples
                        annualReturnRate: 10, // Default 10% a.a.
                        adminFeeRate: 0,
                        years: 1,
                        userId
                    }
                });
                savedId = inv.id;
                replyText = `📈 *Simulação de Investimento Criada!*
💼 ${data.description}
💰 Aporte Inicial: R$ ${data.amount}
📊 Cenário padrão (10% a.a) aplicado.`;
                break;
            }

            case 'PAYABLE': {
                const data = result.data as any;
                const dueDate = new Date(data.dueDate || new Date());
                const monthKey = dueDate.toISOString().slice(0, 7); // YYYY-MM

                // Busca ou cria Janela de Pagamento para o mês
                let window = await prisma.paymentWindow.findFirst({
                    where: {
                        month: monthKey,
                        userId
                    }
                });

                if (!window) {
                    window = await prisma.paymentWindow.create({
                        data: {
                            month: monthKey,
                            windowDay: 30, // Default fim do mês
                            receivedAmount: 0, // Ajuste para Decimal depois se precisar
                            userId
                        }
                    });
                }

                const payable = await prisma.payable.create({
                    data: {
                        name: data.description,
                        amount: data.amount,
                        dueDate: dueDate,
                        paymentWindowId: window.id,
                        isPaid: false
                    }
                });
                savedId = payable.id;
                replyText = `🧾 *Conta a Pagar Agendada!*
📝 ${data.description}
💲 Valor: R$ ${data.amount}
📅 Vencimento: ${dueDate.toLocaleDateString('pt-BR')}`;
                break;
            }

            case 'PLANNING': {
                // Implementação pendente para BudgetEnvelope com userId
                // Para evitar erros de build se BudgetEnvelope exigir userId, vamos comentar por hora ou adicionar
                // const data = result.data as any;
                // ...
                replyText = "⚠️ Módulo Planejamento em atualização. Tente novamente mais tarde.";
                break;
            }

            default:
                replyText = "❓ Entendi o texto, mas não soube em qual módulo salvar.";
        }

        await sendWhatsAppReply(remoteJid, replyText);
        return NextResponse.json({ success: true, savedId, intent: result.intent });

    } catch (error) {
        console.error("❌ ERRO WEBHOOK:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// Helper Simples de Envio
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
            await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            break;
        } catch (e) { /* silent */ }
    }
}
