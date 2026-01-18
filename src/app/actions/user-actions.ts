'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const DEFAULT_PROFILE_ID = 'default';

export async function getUserProfile() {
    try {
        let profile = await prisma.userProfile.findUnique({
            where: { id: DEFAULT_PROFILE_ID }
        });

        if (!profile) {
            try {
                profile = await prisma.userProfile.create({
                    data: {
                        id: DEFAULT_PROFILE_ID,
                        name: 'Usuário',
                        avatarUrl: null
                    }
                });
            } catch (createError) {
                console.error("Erro ao criar perfil padrão:", createError);
                return { id: DEFAULT_PROFILE_ID, name: 'Usuário', avatarUrl: null };
            }
        }
        return profile;
    } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        return { id: DEFAULT_PROFILE_ID, name: 'Usuário', avatarUrl: null };
    }
}

export async function updateUserName(name: string) {
    try {
        await prisma.userProfile.upsert({
            where: { id: DEFAULT_PROFILE_ID },
            create: { id: DEFAULT_PROFILE_ID, name },
            update: { name }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar nome:", error);
        return { success: false, error: "Falha ao atualizar nome" };
    }
}

export async function updateUserAvatar(avatarBase64: string) {
    try {
        await prisma.userProfile.upsert({
            where: { id: DEFAULT_PROFILE_ID },
            create: { id: DEFAULT_PROFILE_ID, name: 'Usuário', avatarUrl: avatarBase64 },
            update: { avatarUrl: avatarBase64 }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar avatar:", error);
        return { success: false, error: "Falha ao salvar imagem" };
    }
}

export async function removeUserAvatar() {
    try {
        await prisma.userProfile.update({
            where: { id: DEFAULT_PROFILE_ID },
            data: { avatarUrl: null }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Erro ao remover avatar:", error);
        return { success: false, error: "Falha ao remover imagem" };
    }
}
