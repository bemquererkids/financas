
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Retorna a chave pública para o frontend
    // Isso garante que mesmo se o build time env var falhar, o runtime pega.
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();

    if (!key) {
        return NextResponse.json({ error: 'Chave não configurada no servidor' }, { status: 500 });
    }

    return NextResponse.json({ key });
}
