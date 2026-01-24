
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 minuto

export async function GET() {
    try {
        // Headers robustos para evitar bloqueio WAF da AwesomeAPI
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`[Currency API] External Error: ${response.status}`, text);
            throw new Error(`External API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[Currency API] Handler Error:", error);
        return NextResponse.json(
            { error: "Serviço indisponível", details: error.message },
            { status: 503 }
        );
    }
}
