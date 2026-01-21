'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

export async function updateUserAvatar(avatarUrl: string) {
    const userId = await getUserId();

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { image: avatarUrl }
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Error updating avatar:', error);
        return { error: 'Failed to update avatar' };
    }
}

export async function removeUserAvatar() {
    const userId = await getUserId();

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { image: null }
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Error removing avatar:', error);
        return { error: 'Failed to remove avatar' };
    }
}
