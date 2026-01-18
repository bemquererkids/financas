import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log("Keep calm: Fixing database...");

        // Comandos para forçar a criação das tabelas
        const command = 'npx prisma generate && npx prisma db push --accept-data-loss';

        const { stdout, stderr } = await execAsync(command);

        console.log("DB Fix Output:", stdout);

        return NextResponse.json({
            status: "Success",
            message: "Banco de dados sincronizado com sucesso!",
            details: {
                command,
                output: stdout,
                warnings: stderr
            },
            nextStep: "Agora pode tentar fazer login novamente na raiz /"
        });
    } catch (error: any) {
        console.error("DB Fix Failed:", error);
        return NextResponse.json({
            status: "Error",
            message: "Falha ao sincronizar banco.",
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
