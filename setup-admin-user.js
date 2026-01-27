
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupAdmin() {
    const email = 'admin@mywallet.com';
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🔨 Setting up user: ${email}`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: 'Admin User'
            },
            create: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                onboardingCompleted: true,
                financialSituation: 'equilibrado',
                mainGoal: 'investir'
            }
        });

        console.log('✅ User setup complete:', user.id);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

    } catch (e) {
        console.error('❌ Error setting up user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

setupAdmin();
