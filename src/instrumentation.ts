export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('--- DATABASE AUTO-REPAIR INITIATED ---');
        // Import dynamic to avoid edge runtime issues if any code leaks there
        const { exec } = await import('child_process');

        // Executar db push de forma síncrona/blocking não é ideal, mas garante que rode.
        // Como 'exec' é assíncrono, o servidor pode iniciar antes de terminar, 
        // mas o primeiro request deve pegar o banco pronto se formos rápidos ou se o push for rápido.
        // O ideal seria await, mas register não bloqueia startup 100%.

        exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
            if (error) {
                console.error(`[DB-FIX] Error executing prisma db push: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`[DB-FIX] Stderr: ${stderr}`);
            }
            console.log(`[DB-FIX] Success: ${stdout}`);
        });
    }
}
