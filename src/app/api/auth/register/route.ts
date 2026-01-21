import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação com requisitos de senha forte
const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(11, 'Telefone inválido'),
    password: z
        .string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validar dados
        const validationResult = registerSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, email, phone, password } = validationResult.data;

        // Normalizar nome: primeira letra de cada palavra maiúscula
        const normalizedName = name
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Verificar se email ou telefone já existem
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email ou telefone já cadastrados' },
                { status: 400 }
            );
        }

        // Hash da senha (12 rounds para segurança)
        const hashedPassword = await hash(password, 12);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name: normalizedName,
                email,
                phone,
                password: hashedPassword,
                emailVerified: new Date(), // Auto-verificar por enquanto (pode adicionar email verification depois)
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Conta criada com sucesso!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Erro ao criar conta. Tente novamente.' },
            { status: 500 }
        );
    }
}
