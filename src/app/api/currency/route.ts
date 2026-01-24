
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function getMockData() {
    // Dados de fallback para quando a API externa falhar (Failover)
    // Assim a UI nunca quebra
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    return {
        USDBRL: {
            code: 'USD', codein: 'BRL', name: 'Dólar Americano/Real Brasileiro',
            bid: '5.85', pctChange: '0.01', create_date: now
        },
        EURBRL: {
            code: 'EUR', codein: 'BRL', name: 'Euro/Real Brasileiro',
            bid: '6.42', pctChange: '-0.15', create_date: now
        }
    };
}

export async function GET() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyWalletBot/1.0)',
                'Accept': 'application/json'
            },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            console.warn(`[Currency API] External API Error ${response.status}. Using fallback.`);
            return NextResponse.json(getMockData());
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[Currency API] Network Error:", error.message);
        // Em último caso, retorna Mock para não deixar o frontend vermelho
        return NextResponse.json(getMockData());
    }
}
