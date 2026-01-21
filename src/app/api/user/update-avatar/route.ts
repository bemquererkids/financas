import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const { image } = await req.json();

        if (!image || !image.startsWith('data:image/')) {
            return NextResponse.json(
                { error: 'Imagem inválida' },
                { status: 400 }
            );
        }

        // Atualizar imagem do usuário
        await prisma.user.update({
            where: { email: session.user.email },
            data: { image },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Avatar update error:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar foto' },
            { status: 500 }
        );
    }
}
