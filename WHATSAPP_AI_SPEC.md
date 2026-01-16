# 🤖 Especificação: Assistente Financeiro WhatsApp + IA

Esta funcionalidade permite que o usuário envie notas de voz ou texto via WhatsApp para registrar transações automaticamente.

## 1. Fluxo de Dados
1.  **Usuário**: Envia áudio: "Gastei 50 reais no almoço com a equipe".
2.  **WhatsApp Provider (Twilio/Meta)**: Recebe a mídia e chama o Webhook do App.
3.  **Next.js API (`/api/whatsapp`)**:
    *   Recebe o payload.
    *   Baixa o arquivo de áudio (se for voz).
4.  **Serviço de IA (`AiProcessor`)**:
    *   **Transcrição (Whisper)**: Converte áudio em texto -> "Gastei 50 reais no almoço com a equipe".
    *   **Extração (LLM)**: Identifica intenção e dados.
        ```json
        {
          "intent": "CREATE_TRANSACTION",
          "amount": 50.00,
          "description": "Almoço com equipe",
          "category": "Alimentação",
          "type": "EXPENSE",
          "date": "2024-03-20T12:00:00Z"
        }
        ```
5.  **Persistência**: O App salva no PostgreSQL via Prisma.
6.  **Confirmação**: Envia resposta no WhatsApp: "✅ *Almoço* de R$ 50,00 registrado em *Alimentação*."

## 2. Tecnologias Necessárias
*   **Provedor WhatsApp**: Twilio (Recomendado para Dev/Sandbox) ou Meta Cloud API (Produção).
*   **IA**: OpenAI API (Whisper-1 para áudio, GPT-4o-mini para texto).
*   **Tunneling**: Ngrok (para expor o localhost para o webhook do WhatsApp durante desenvolvimento).

## 3. Estrutura de Código Proposta

### Novas Variáveis de Ambiente (.env)
```env
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
BASE_URL=https://seu-tunnel-ngrok.io
```

### Arquivos
*   `src/app/api/webhooks/whatsapp/route.ts`: Endpoint público.
*   `src/lib/whatsapp.ts`: Cliente para enviar mensagens.
*   `src/lib/ai-assistant.ts`: Lógica de Transcrição e Extração.

## 4. Prompt do Sistema (System Prompt)
O LLM receberá instruções estritas para categorizar corretamente:
> "Você é um assistente financeiro. Analise o texto e extraia uma transação JSON. Use as categorias: Moradia, Mercado, Lazer, Transporte, etc. Se for inconclusivo, peça mais detalhes."

## 5. Próximos Passos
1.  Configurar as chaves de API (OpenAI é mandatório).
2.  Implementar o serviço de extração (Mockado inicialmente se não houver chave).
3.  Criar a rota de API.
