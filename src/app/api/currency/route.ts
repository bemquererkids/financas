
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache por 10 minutos para não estourar limite da API externa

export async function GET() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL', {
            next: { revalidate: 600 }
        });

        if (!response.ok) {
            throw new Error('Falha na API externa');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erro ao buscar cotações:", error);
        return NextResponse.json(
            { error: "Serviço indisponível" },
            { status: 503 }
        );
    }
}
