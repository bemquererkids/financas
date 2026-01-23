# 🚀 Configuração do Google Vertex AI

## ✅ Status Atual

O chat agora está configurado para usar **Google Vertex AI** em vez do Google AI Studio, o que oferece:

- ✅ **Multimodalidade**: Suporte a texto, imagens, vídeo e áudio
- ✅ **Maior controle**: Configuração de projeto e região do Google Cloud
- ✅ **Recursos empresariais**: SLA, quotas personalizadas, etc.
- ✅ **Modelos mais recentes**: Acesso prioritário a novos modelos

---

## 🔧 Configuração Necessária

### 1. **Obter o ID do Projeto Google Cloud**

Você precisa substituir `your-project-id` no arquivo `.env` pelo ID real do seu projeto no Google Cloud.

#### Como encontrar:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. No topo da página, você verá o nome do projeto
3. Clique nele e copie o **Project ID** (não o nome)

**Exemplo**:
```
GOOGLE_CLOUD_PROJECT=meu-projeto-financeiro-123456
```

### 2. **Configurar a Região**

A região padrão é `us-central1`, mas você pode mudar para uma mais próxima:

**Regiões disponíveis**:
- `us-central1` (Iowa, EUA) - Padrão
- `us-east4` (Virginia, EUA)
- `europe-west1` (Bélgica)
- `asia-northeast1` (Tóquio)
- `southamerica-east1` (São Paulo) ⭐ **Recomendado para Brasil**

**Exemplo**:
```env
GOOGLE_CLOUD_LOCATION=southamerica-east1
```

### 3. **API Key do Vertex AI**

Você já tem a chave configurada:
```env
VERTEX_API_KEY=AQ.Ab8RN6JyC4JUdorXQKbcodTMnwmFMRlVLTUqOx6ZpIx7Oshi0A
GOOGLE_GENERATIVE_AI_API_KEY=AQ.Ab8RN6JyC4JUdorXQKbcodTMnwmFMRlVLTUqOx6ZpIx7Oshi0A
```

---

## 📝 Arquivo `.env` Completo

```env
# Database
DATABASE_URL="postgresql://admin:admin123@localhost:5432/financial_db"

# App Security
NEXTAUTH_SECRET="minha-senha-secreta-super-dificil-123"
NEXTAUTH_URL="http://localhost:3000"

# Usuário Mestre
APP_USER="admin"
APP_PASSWORD="123"

# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=financial_db

# OpenAI (backup)
OPENAI_API_KEY=sk-proj-...

# Google Vertex AI ⭐
VERTEX_API_KEY=AQ.Ab8RN6JyC4JUdorXQKbcodTMnwmFMRlVLTUqOx6ZpIx7Oshi0A
GOOGLE_CLOUD_PROJECT=SEU-PROJETO-ID-AQUI  # ⚠️ SUBSTITUIR
GOOGLE_CLOUD_LOCATION=southamerica-east1   # Ou us-central1
GOOGLE_GENERATIVE_AI_API_KEY=AQ.Ab8RN6JyC4JUdorXQKbcodTMnwmFMRlVLTUqOx6ZpIx7Oshi0A
```

---

## 🎯 Recursos Multimodais Disponíveis

Com Vertex AI, você pode expandir o chat para:

### 1. **Análise de Imagens** 📸
```typescript
// Exemplo futuro: Analisar fotos de recibos
const result = await streamText({
    model: vertex('gemini-2.0-flash-exp'),
    messages: [
        {
            role: 'user',
            content: [
                { type: 'text', text: 'Extraia os dados deste recibo' },
                { type: 'image', image: receiptImageUrl }
            ]
        }
    ]
});
```

### 2. **Análise de Vídeos** 🎥
```typescript
// Exemplo futuro: Analisar vídeos de compras
const result = await streamText({
    model: vertex('gemini-2.0-flash-exp'),
    messages: [
        {
            role: 'user',
            content: [
                { type: 'text', text: 'Liste os produtos neste vídeo' },
                { type: 'video', video: videoUrl }
            ]
        }
    ]
});
```

### 3. **Análise de Áudio** 🎤
```typescript
// Exemplo futuro: Transcrever comandos de voz
const result = await streamText({
    model: vertex('gemini-2.0-flash-exp'),
    messages: [
        {
            role: 'user',
            content: [
                { type: 'audio', audio: audioUrl }
            ]
        }
    ]
});
```

---

## 🔍 Verificação da Configuração

### Teste 1: Verificar se o Vertex AI está ativo

Após configurar o `GOOGLE_CLOUD_PROJECT`, reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Teste 2: Verificar logs

Ao enviar uma mensagem no chat, você deve ver nos logs:

```
🛠️ Executando ferramenta add_transaction: { ... }
```

Se houver erro de autenticação, você verá:

```
Error: Invalid project ID or API key
```

---

## 🐛 Troubleshooting

### Erro: "Invalid project ID"

**Solução**: Verifique se você substituiu `your-project-id` pelo ID real do projeto.

### Erro: "Permission denied"

**Solução**: 
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services** > **Library**
3. Procure por "Vertex AI API"
4. Clique em **Enable**

### Erro: "Quota exceeded"

**Solução**: Você atingiu o limite gratuito. Verifique as quotas em:
- [Google Cloud Console](https://console.cloud.google.com/) > **IAM & Admin** > **Quotas**

---

## 💡 Próximos Passos

### 1. **Upload de Recibos** 📸
Adicionar funcionalidade para o usuário tirar foto de recibos e o agente extrair automaticamente:
- Valor
- Estabelecimento
- Data
- Itens comprados

### 2. **Comandos de Voz** 🎤
Permitir que o usuário fale comandos como:
- "Registre uma despesa de 50 reais com Uber"
- "Qual é o meu saldo?"

### 3. **Análise de Extratos em PDF** 📄
Upload de extratos bancários em PDF para análise automática e categorização.

---

## 📚 Documentação Oficial

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [AI SDK Google Vertex Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/google-vertex)

---

## ✨ Benefícios do Vertex AI vs Google AI Studio

| Recurso | Google AI Studio | Vertex AI |
|---------|------------------|-----------|
| Multimodalidade | ✅ Limitado | ✅ Completo |
| Vídeo | ❌ | ✅ |
| Áudio | ❌ | ✅ |
| SLA Empresarial | ❌ | ✅ |
| Quotas Personalizadas | ❌ | ✅ |
| Controle de Região | ❌ | ✅ |
| Preço | Grátis (limitado) | Pay-as-you-go |

---

**🎉 Agora você está usando Vertex AI com todas as possibilidades multimodais!**

**Próximo passo**: Configure o `GOOGLE_CLOUD_PROJECT` no `.env` e teste o chat!
