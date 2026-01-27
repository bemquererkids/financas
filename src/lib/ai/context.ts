import { prisma } from "@/lib/prisma";

export async function buildFinancialContext(userId: string) {
    // 1. Fetch User Data & Profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userFacts: true, // Long-term memory
            goals: { where: { status: 'IN_PROGRESS' } },
            debts: { where: { status: { not: 'PAID' } } }
        }
    });

    if (!user) throw new Error("User not found");

    // 2. Fetch Recent Transactions (Last 15)
    // Provides immediate context on spending habits
    const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 15
    });

    // 3. Calculate Financial Snapshot (Real-time)
    const income = recentTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = recentTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // Format User Facts into a readable list
    const factsList = user.userFacts.map(f => `- ${f.fact} (${f.category})`).join('\n');

    // Format Transactions
    const txList = recentTransactions.map(t =>
        `- [${t.date.toLocaleDateString()}] ${t.description}: R$ ${Number(t.amount).toFixed(2)} (${t.category})`
    ).join('\n');

    // Format Goals
    const goalsList = user.goals.map(g =>
        `- Objetivo: ${g.description} (Meta: R$ ${g.targetAmount?.toFixed(2) || 'N/A'})`
    ).join('\n');

    // Format Debts
    const debtsList = user.debts.map(d =>
        `- Dívida: ${d.name} (R$ ${Number(d.totalValue).toFixed(2)})`
    ).join('\n');

    // Construct the Context String
    const context = `
== PERFIL DO USUÁRIO ==
Nome: ${user.name || 'Usuário'}
Renda Mensal Declarada: R$ ${user.monthlyIncome || 'N/A'}
Situação Financeira: ${user.financialSituation || 'N/A'}
Perfil: ${user.userProfile || 'N/A'}

== MEMÓRIA DE LONGO PRAZO (Fatos Importantes) ==
${factsList || 'Nenhum fato registrado ainda.'}

== SAÚDE FINANCEIRA ATUAL (Snapshot) ==
Entradas Recentes (baseado nas últimas 15 tx): R$ ${income.toFixed(2)}
Saídas Recentes (baseado nas últimas 15 tx): R$ ${expenses.toFixed(2)}
Objetivos Ativos:
${goalsList || 'Nenhum objetivo ativo.'}
Dívidas em Aberto:
${debtsList || 'Nenhuma dívida registrada.'}

== ÚLTIMAS 15 TRANSAÇÕES ==
${txList || 'Nenhuma transação recente.'}

== INSTRUÇÕES PARA O ASSISTENTE ==
1. Use os dados acima para personalizar suas respostas.
2. Se o usuário perguntar "quanto gastei com Uber?", olhe as transações.
3. Se o usuário falar sobre um novo objetivo ou fato importante (ex: "vou ter um filho"), extraia isso para a memória.
4. Seja empático e aja como um consultor financeiro experiente.
`;

    return context;
}
