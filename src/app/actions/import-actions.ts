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

    // Normalizar quebras de linha e espaços extras
    // Remove caracteres nulos ou de controle que as vezes vêm em arquivos bancários
    const cleanData = data.replace(/\r/g, '').trim();

    // Estratégia Robusta v2: Split por "STMTTRN" (ignorando < e > no split para ser mais flexível)
    // Tenta encontrar o início de cada bloco de transação
    // O split vai "comer" o tag inicial, mas o conteúdo estará no item do array
    const parts = cleanData.split(/<STMTTRN/i);

    // O primeiro item (parts[0]) geralmente é o header ou lixo antes da primeira tx
    for (let i = 1; i < parts.length; i++) {
        let block = parts[i];

        // Se o bloco foi splitado apenas em "STMTTRN" (sem >), o ">" pode estar no início do block.
        // Vamos garantir que começamos a ler DEPOIS do fechamento da tag inicial se ela existir
        if (block.startsWith('>')) {
            block = block.substring(1);
        } else if (block.startsWith(' >')) {
            block = block.substring(2);
        }

        // Remove, se houver, o fechamento </STMTTRN> e tudo depois dele
        // Para garantir que não estamos lendo lixo de outras tags
        const endBlock = block.search(/<\/STMTTRN/i);
        if (endBlock !== -1) {
            block = block.substring(0, endBlock);
        }

        // Helper mais tolerante para extrair valor
        // Procura <TAG>VALOR, onde VALOR vai até <, \n ou fim.
        const getTag = (tag: string) => {
            // Regex:
            // <TAG\s*> : Abre tag, possiveis espaços
            // ([^<]*)  : O valor (tudo que não é <)
            const regex = new RegExp(`<${tag}[^>]*>([^<]*)`, 'i');
            const match = block.match(regex);
            return match ? match[1].trim() : null;
        };

        const type = getTag('TRNTYPE');
        const amountStr = getTag('TRNAMT');
        const id = getTag('FITID');
        const dateRaw = getTag('DTPOSTED');
        const memo = getTag('MEMO');
        const name = getTag('NAME');
        const checkNum = getTag('CHECKNUM');
        const refNum = getTag('REFNUM');

        if (amountStr && dateRaw) {
            // Tratamento de valor para PT-BR e outros formatos
            let safeAmount = amountStr.replace(/\s/g, ''); // Remove espaços internos

            // Corrige sinal invertido se necessário (alguns bancos mandam débito como positivo e Type=DEBIT)
            // Mas o padrão OFX é: Saída = Negativo, Entrada = Positivo.
            // Vamos respeitar o sinal do valor numérico se existir.

            // Hack para formatos brasileiros errados (ex: 1.200,50 ou 1,200.50)
            // Se tem apenas vírgula como separador, troca por ponto
            if (safeAmount.indexOf(',') !== -1 && safeAmount.indexOf('.') === -1) {
                safeAmount = safeAmount.replace(',', '.');
            }
            // Se tem ponto e vírgula (ex: 1.000,00)
            else if (safeAmount.indexOf('.') !== -1 && safeAmount.indexOf(',') !== -1) {
                // Assume que o último separador é o decimal
                if (safeAmount.lastIndexOf(',') > safeAmount.lastIndexOf('.')) {
                    // Euro/BR style: 1.000,00 -> remove ponto, troca virgula por ponto
                    safeAmount = safeAmount.replace(/\./g, '').replace(',', '.');
                } else {
                    // US style: 1,000.00 -> remove virgula
                    safeAmount = safeAmount.replace(/,/g, '');
                }
            }

            transactions.push({
                TRNAMT: safeAmount,
                DTPOSTED: dateRaw,
                MEMO: memo || name || checkNum || refNum || "Transação Importada",
                FITID: id || `${dateRaw}-${Math.random().toString(36).substr(2, 9)}` // Fallback ID
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
