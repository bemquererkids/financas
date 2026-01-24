'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validação
const OFXInputSchema = z.string().min(10, "Arquivo OFX inválido ou vazio");

// --- CUSTOM OFX PARSER (No External Deps) ---
function parseOFX(data: string) {
    const transactions: any[] = [];

    // Normalizar quebras de linha para evitar problemas regex
    // Alguns OFX vêm tudo em uma linha, outros com \r\n
    const cleanData = data.replace(/\r/g, '');

    // Estratégia Robusta: Split por <STMTTRN>
    // Isso funciona mesmo se não tiver tag de fechamento </STMTTRN> (comum em SGML antigo)
    const blocks = cleanData.split(/<STMTTRN>/i);

    // Começa do 1 porque o 0 é o header antes da primeira tx
    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];

        // Helper para extrair valor de tag (case insensitive)
        // P procura: <TAG>... (até encontrar <, \n ou fim da string)
        const getTag = (tag: string) => {
            const regex = new RegExp(`<${tag}>(.*?)(?:<|\\n|$)`, 'i');
            return block.match(regex)?.[1]?.trim();
        };

        const type = getTag('TRNTYPE');
        const amountStr = getTag('TRNAMT');
        const id = getTag('FITID');
        const dateRaw = getTag('DTPOSTED');
        const memo = getTag('MEMO');
        const name = getTag('NAME'); // Às vezes vem como NAME

        if (amountStr && dateRaw) {
            // Tratamento de valor para PT-BR (se vier virgula sem ponto, troca. Se vier 1.000,00...)
            // O padrão OFX é PONTO decimal (US), mas alguns bancos BR mandam virrgula.
            let safeAmount = amountStr;
            // Hack simples: se tem virgula e não tem ponto -> troca virgula por ponto
            if (safeAmount.includes(',') && !safeAmount.includes('.')) {
                safeAmount = safeAmount.replace(',', '.');
            }

            transactions.push({
                TRNAMT: safeAmount,
                DTPOSTED: dateRaw,
                MEMO: memo || name || "Sem descrição",
                FITID: id
            });
        }
    }

    return transactions;
}

export async function processOFXUpload(fileContent: string) {
    // 1. Autenticação e Segurança
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }
    const userId = session.user.id;

    // 2. Validação do Input (Governança)
    const validation = OFXInputSchema.safeParse(fileContent);
    if (!validation.success) {
        return { success: false, error: "Formato de arquivo inválido" };
    }

    try {
        // 3. Parsing Seguro (Custom)
        const txList = parseOFX(fileContent);

        if (txList.length === 0) {
            return { success: false, error: "Nenhuma transação válida encontrada." };
        }

        let importedCount = 0;
        let skippedCount = 0;

        // 4. Processamento Inteligente com Deduplicação
        for (const tx of txList) {
            const amount = parseFloat(tx.TRNAMT);
            const description = tx.MEMO;

            // Tratamento de Data (OFX vem como YYYYMMDDHHMMSS...)
            const dateStr = tx.DTPOSTED.substring(0, 8);
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const date = new Date(`${year}-${month}-${day}T12:00:00Z`); // Fix UTC

            // Lógica de Deduplicação: Verifica se já existe transação igual neste dia p/ este user
            const existing = await prisma.transaction.findFirst({
                where: {
                    userId,
                    amount: Math.abs(amount), // Guardamos sempre positivo no banco, com type INCOME/EXPENSE
                    date: {
                        gte: new Date(`${year}-${month}-${day}T00:00:00`),
                        lte: new Date(`${year}-${month}-${day}T23:59:59`),
                    },
                    description: description
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Categorização Básica (Fallback se não tiver IA no momento)
            // Futuramente conectaremos a IA aqui para ser mais preciso
            let type: 'INCOME' | 'EXPENSE' = amount > 0 ? 'INCOME' : 'EXPENSE';
            let category = 'OTHER';

            const descUpper = description.toUpperCase();
            if (descUpper.includes('UBER') || descUpper.includes('POSTO')) category = 'TRANSPORT';
            if (descUpper.includes('IFOOD') || descUpper.includes('MERCADO') || descUpper.includes('PADARIA')) category = 'FOOD';
            if (descUpper.includes('ALUGUEL') || descUpper.includes('CONDOMINIO')) category = 'HOUSING';
            if (descUpper.includes('SALARIO') || descUpper.includes('PIX RECEBIDO')) category = 'SALARY';

            // 5. Persistência Segura
            await prisma.transaction.create({
                data: {
                    userId,
                    description,
                    amount: Math.abs(amount),
                    type,
                    category,
                    date
                }
            });
            importedCount++;
        }

        revalidatePath('/');
        return {
            success: true,
            message: `Processado com sucesso!`,
            stats: { imported: importedCount, skipped: skippedCount }
        };

    } catch (error: any) {
        console.error("Erro ao processar OFX:", error);
        return { success: false, error: "Erro ao ler o arquivo. Verifique o formato." };
    }
}
