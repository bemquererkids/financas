
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
            console.warn(`[Currency API] AwesomeAPI Error ${response.status}. Trying Backup (Frankfurter)...`);
            try {
                // Backup: Frankfurter API (Dados reais do Banco Central Europeu)
                const [usdRes, eurRes] = await Promise.all([
                    fetch('https://api.frankfurter.app/latest?from=USD&to=BRL', { next: { revalidate: 60 } }),
                    fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL', { next: { revalidate: 60 } })
                ]);

                if (usdRes.ok && eurRes.ok) {
                    const usdData = await usdRes.json();
                    const eurData = await eurRes.json();
                    const now = new Date().toISOString();

                    // Formata para o padrão que o frontend espera (igual AwesomeAPI)
                    return NextResponse.json({
                        USDBRL: {
                            code: 'USD', codein: 'BRL', name: 'Dólar Americano/Real Brasileiro',
                            bid: usdData.rates.BRL.toFixed(2), pctChange: '0.00', create_date: now
                        },
                        EURBRL: {
                            code: 'EUR', codein: 'BRL', name: 'Euro/Real Brasileiro',
                            bid: eurData.rates.BRL.toFixed(2), pctChange: '0.00', create_date: now
                        }
                    });
                }
            } catch (errBackup) {
                console.error("[Currency API] Backup failed:", errBackup);
            }

            // Último recurso: Mock
            return NextResponse.json(getMockData());
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[Currency API] Primary Network Error:", error.message);

        // Tenta Backup em caso de erro de rede no primário também
        try {
            const [usdRes, eurRes] = await Promise.all([
                fetch('https://api.frankfurter.app/latest?from=USD&to=BRL'),
                fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL')
            ]);
            if (usdRes.ok && eurRes.ok) {
                const usdData = await usdRes.json();
                const eurData = await eurRes.json();
                const now = new Date().toISOString();
                return NextResponse.json({
                    USDBRL: { code: 'USD', codein: 'BRL', name: 'Dólar/Real', bid: usdData.rates.BRL.toFixed(2), pctChange: '0', create_date: now },
                    EURBRL: { code: 'EUR', codein: 'BRL', name: 'Euro/Real', bid: eurData.rates.BRL.toFixed(2), pctChange: '0', create_date: now }
                });
            }
        } catch (e) { }

        return NextResponse.json(getMockData());
    }
}
