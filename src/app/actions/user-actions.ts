'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const DEFAULT_PROFILE_ID = 'default';

export async function getUserProfile() {
    let profile = await prisma.userProfile.findUnique({
        where: { id: DEFAULT_PROFILE_ID }
    });

    // Criar perfil padrão se não existir
    if (!profile) {
        profile = await prisma.userProfile.create({
            data: {
                id: DEFAULT_PROFILE_ID,
                name: 'Usuário'
            }
        });
    }

    return profile;
}

export async function updateUserName(name: string) {
    await prisma.userProfile.upsert({
        where: { id: DEFAULT_PROFILE_ID },
        create: { id: DEFAULT_PROFILE_ID, name },
        update: { name }
    });

    revalidatePath('/');
    return { success: true };
}

export async function updateUserAvatar(avatarBase64: string) {
    await prisma.userProfile.upsert({
        where: { id: DEFAULT_PROFILE_ID },
        create: { id: DEFAULT_PROFILE_ID, name: 'Usuário', avatarUrl: avatarBase64 },
        update: { avatarUrl: avatarBase64 }
    });

    revalidatePath('/');
    return { success: true };
}

export async function removeUserAvatar() {
    await prisma.userProfile.update({
        where: { id: DEFAULT_PROFILE_ID },
        data: { avatarUrl: null }
    });

    revalidatePath('/');
    return { success: true };
}
