
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            transactions: {
                take: 5,
                orderBy: { date: 'desc' }
            }
        }
    });

    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`User ID: ${u.id}`);
        console.log(`Name: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Monthly Income: ${u.monthlyIncome} (Type: ${typeof u.monthlyIncome})`);
        console.log(`Transactions Count: ${u.transactions.length}`);
        console.log('Last Transactions:');
        u.transactions.forEach(t => {
            console.log(`  - ${t.date.toISOString()} | ${t.type} | Amount: ${t.amount} | Desc: ${t.description}`);
        });
        console.log('----------------');
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
