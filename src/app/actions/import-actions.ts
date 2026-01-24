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

    // OFX é meio SGML/XML. Vamos usar Regex robusto para extrair o bloco STMTTRN
    // Isso evita problemas com bibliotecas legadas que quebram no build
    const transationsMatches = data.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g) || [];

    transationsMatches.forEach(block => {
        const type = block.match(/<TRNTYPE>(.*?)(\n|<)/)?.[1]?.trim();
        const amount = block.match(/<TRNAMT>(.*?)(\n|<)/)?.[1]?.trim();
        const id = block.match(/<FITID>(.*?)(\n|<)/)?.[1]?.trim();
        const dateRaw = block.match(/<DTPOSTED>(.*?)(\n|<)/)?.[1]?.trim();
        const memo = block.match(/<MEMO>(.*?)(\n|<)/)?.[1]?.trim();
        const name = block.match(/<NAME>(.*?)(\n|<)/)?.[1]?.trim();

        if (amount && dateRaw) {
            transactions.push({
                TRNAMT: amount,
                DTPOSTED: dateRaw,
                MEMO: memo || name || "Sem descrição",
                FITID: id
            });
        }
    });

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
