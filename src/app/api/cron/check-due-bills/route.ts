import { NextResponse } from 'next/server';
import { checkDueBills } from '@/app/actions/notification-actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Nota: checkDueBills depende da sessão do usuário.
        // Se chamado via navegador (com cookie), funciona.
        // Se chamado via Cron externo, falhará a menos que refatorado para ignorar sessão via API Key.
        const result = await checkDueBills();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
