
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente manualmente
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function testAIConnection() {
    console.log("🟦 Iniciando teste de conexão com IA...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("❌ ERRO: API Key não encontrada no .env");
        return;
    }

    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const modelName = 'gemini-2.0-flash'; // O modelo que queremos validar

    try {
        console.log(`Testing model: ${modelName}...`);

        const { text } = await generateText({
            model: google(modelName),
            prompt: 'Responda apenas com a palavra "FUNCIONANDO" se você estiver recebendo esta mensagem.'
        });

        console.log(`✅ Sucesso! Resposta da IA: "${text}"`);
        console.log("Conclusão: O modelo está ativo e respondendo corretamente.");

    } catch (error: any) {
        console.error("\n❌ Falha no teste:");
        console.error(`Erro: ${error.message}`);

        if (error.message.includes('not found') || error.message.includes('404')) {
            console.log("Dica: O modelo pode não estar disponível nesta API key ou região.");
        }
    }
}

testAIConnection();
