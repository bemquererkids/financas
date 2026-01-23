# 🤖 Plano de Melhoria do Agente Financeiro com Google ADK

## 📋 Visão Geral
Transformar o assistente atual em um **Agente Autônomo Multi-Modal** usando Google ADK, com capacidade de processar texto, áudio, imagens e PDFs, executando tarefas financeiras com segurança e precisão.

---

## 🎯 Objetivos Principais

### 1. **Processamento Multi-Modal**
- ✅ **Texto**: Já funcional
- 🎤 **Áudio**: Transcrição de comandos de voz (ex: "Gastei 50 reais no mercado")
- 📸 **Imagem**: OCR de recibos/boletos para extração automática de dados
- 📄 **PDF**: Análise de extratos bancários e faturas de cartão

### 2. **Agente Autônomo com Guardrails**
- **Sub-agentes especializados** para diferentes tarefas
- **Validação rigorosa** antes de executar ações
- **Confirmação do usuário** para operações críticas
- **Logs de auditoria** de todas as ações

### 3. **Capacidades Avançadas**
- Análise preditiva de gastos
- Sugestões proativas de economia
- Alertas inteligentes de vencimentos
- Categorização automática de transações

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (ChatWidget)                     │
│  - Input Multi-Modal (Texto, Áudio, Imagem, PDF)            │
│  - Confirmação de Ações Críticas                            │
│  - Feedback Visual de Processamento                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR AGENT (ADK)                        │
│  - Roteamento Inteligente de Tarefas                        │
│  - Validação de Entrada                                     │
│  - Gerenciamento de Contexto                                │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ OCR      │  │ Speech   │  │ Financial│  │ Analytics│
│ Agent    │  │ Agent    │  │ Agent    │  │ Agent    │
│          │  │          │  │          │  │          │
│ - Gemini │  │ - Speech │  │ - Tools  │  │ - Gemini │
│   Vision │  │   to Text│  │ - DB Ops │  │   Pro    │
│ - Extract│  │ - PT-BR  │  │ - Validar│  │ - Predict│
│   Data   │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    GUARDRAILS LAYER                          │
│  ✓ Validação de Valores (min/max)                           │
│  ✓ Verificação de Duplicatas                                │
│  ✓ Confirmação para valores > R$ 1000                       │
│  ✓ Rate Limiting (prevenir spam)                            │
│  ✓ Sanitização de Dados                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Guardrails Implementados

### 1. **Validação de Entrada**
```typescript
// Exemplo de validação
const inputGuardrails = {
  maxTransactionValue: 50000, // R$ 50k
  minTransactionValue: 0.01,
  allowedCategories: ['FOOD', 'TRANSPORT', 'HOUSING', ...],
  maxDescriptionLength: 200,
  dateRange: { min: '2020-01-01', max: 'hoje + 1 dia' }
};
```

### 2. **Confirmação de Ações Críticas**
- Transações > R$ 1.000
- Exclusão de dados
- Alteração de metas/orçamentos
- Exportação de dados

### 3. **Prevenção de Alucinações**
- **Grounding**: Sempre usar dados reais do banco
- **Structured Output**: Forçar schema Zod para respostas
- **Fact-Checking**: Validar cálculos antes de exibir
- **Source Attribution**: Citar de onde veio cada informação

### 4. **Rate Limiting**
```typescript
const rateLimits = {
  maxRequestsPerMinute: 10,
  maxTransactionsPerHour: 50,
  maxImageUploadsPerDay: 100
};
```

---

## 📸 Implementação Multi-Modal

### 1. **Processamento de Imagens (OCR de Recibos)**

#### Backend: `/api/agent/process-image`
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Prompt especializado para extração de dados
const ocrPrompt = `
Você é um especialista em extração de dados de recibos e boletos brasileiros.

TAREFA: Analise a imagem e extraia:
1. Data da transação (formato: YYYY-MM-DD)
2. Valor total (apenas números, ex: 45.90)
3. Estabelecimento/Descrição
4. Categoria sugerida (FOOD, TRANSPORT, HOUSING, etc.)

REGRAS:
- Se não conseguir identificar algum campo, retorne null
- Valores devem ser numéricos (sem R$, vírgulas como ponto)
- Datas no formato ISO
- Seja conservador: se não tiver certeza, retorne null

FORMATO DE SAÍDA (JSON):
{
  "date": "2026-01-22",
  "amount": 45.90,
  "description": "Supermercado ABC",
  "category": "FOOD",
  "confidence": 0.95
}
`;

export async function POST(req: Request) {
  const { image } = await req.json();
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          date: { type: "string", nullable: true },
          amount: { type: "number", nullable: true },
          description: { type: "string", nullable: true },
          category: { type: "string", nullable: true },
          confidence: { type: "number" }
        }
      }
    }
  });

  const result = await model.generateContent([
    ocrPrompt,
    { inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } }
  ]);

  const extracted = JSON.parse(result.response.text());
  
  // Guardrail: Validar confiança mínima
  if (extracted.confidence < 0.7) {
    return Response.json({ 
      success: false, 
      message: "Imagem com baixa qualidade. Por favor, tire outra foto." 
    });
  }

  return Response.json({ success: true, data: extracted });
}
```

#### Frontend: Fluxo de Confirmação
```tsx
// Após OCR, mostrar card de confirmação
<ConfirmationCard>
  <h3>Dados Extraídos da Imagem</h3>
  <Field label="Data" value={extracted.date} editable />
  <Field label="Valor" value={extracted.amount} editable />
  <Field label="Descrição" value={extracted.description} editable />
  <Field label="Categoria" value={extracted.category} editable />
  
  <ButtonGroup>
    <Button onClick={confirmAndSave}>✓ Confirmar</Button>
    <Button onClick={discard}>✗ Descartar</Button>
  </ButtonGroup>
</ConfirmationCard>
```

---

### 2. **Processamento de Áudio (Speech-to-Text)**

#### Backend: `/api/agent/process-audio`
```typescript
import { SpeechClient } from '@google-cloud/speech';

const client = new SpeechClient();

export async function POST(req: Request) {
  const { audioBase64 } = await req.json();

  const [response] = await client.recognize({
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'pt-BR',
      model: 'latest_long',
      enableAutomaticPunctuation: true,
    },
    audio: { content: audioBase64 },
  });

  const transcription = response.results
    ?.map(result => result.alternatives?.[0]?.transcript)
    .join(' ');

  // Enviar transcrição para o agente financeiro
  return Response.json({ transcription });
}
```

#### Frontend: Botão de Gravação
```tsx
const [isRecording, setIsRecording] = useState(false);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  
  recorder.ondataavailable = async (e) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const { transcription } = await fetch('/api/agent/process-audio', {
        method: 'POST',
        body: JSON.stringify({ audioBase64: base64 })
      }).then(r => r.json());
      
      setInput(transcription); // Preencher input com transcrição
    };
    reader.readAsDataURL(e.data);
  };
  
  recorder.start();
  mediaRecorderRef.current = recorder;
  setIsRecording(true);
};
```

---

### 3. **Processamento de PDF (Extratos Bancários)**

#### Backend: `/api/agent/process-pdf`
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('pdf') as File;
  const buffer = await file.arrayBuffer();
  
  // Extrair texto do PDF
  const pdfData = await pdf(Buffer.from(buffer));
  const text = pdfData.text;

  // Usar Gemini para estruturar os dados
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                description: { type: "string" },
                amount: { type: "number" },
                type: { type: "string", enum: ["INCOME", "EXPENSE"] }
              }
            }
          }
        }
      }
    }
  });

  const prompt = `
Analise este extrato bancário e extraia TODAS as transações.

REGRAS:
- Ignore saldo anterior/atual
- Identifique se é INCOME (crédito) ou EXPENSE (débito)
- Datas no formato YYYY-MM-DD
- Valores sempre positivos

TEXTO DO EXTRATO:
${text}
`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());

  return Response.json({ 
    success: true, 
    transactions: parsed.transactions,
    totalFound: parsed.transactions.length 
  });
}
```

---

## 🤖 Sub-Agentes Especializados (ADK)

### 1. **Financial Agent** (Operações CRUD)
```typescript
import { Agent } from '@google/adk';

const financialAgent = new Agent({
  name: 'FinancialOperator',
  description: 'Executa operações financeiras com validação',
  tools: [
    {
      name: 'add_transaction',
      schema: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        amount: z.number().min(0.01).max(50000),
        description: z.string().max(200),
        type: z.enum(['INCOME', 'EXPENSE']),
        category: z.string()
      }),
      execute: async (params) => {
        // Guardrail: Verificar duplicatas
        const isDuplicate = await checkDuplicate(params);
        if (isDuplicate) {
          return { 
            success: false, 
            message: "⚠️ Transação similar já existe. Confirmar mesmo assim?" 
          };
        }

        // Guardrail: Valores altos requerem confirmação
        if (params.amount > 1000) {
          return {
            success: false,
            requiresConfirmation: true,
            message: `Confirmar transação de R$ ${params.amount.toFixed(2)}?`
          };
        }

        // Executar
        const transaction = await prisma.transaction.create({ data: params });
        return { success: true, transaction };
      }
    }
  ]
});
```

### 2. **Analytics Agent** (Análises e Previsões)
```typescript
const analyticsAgent = new Agent({
  name: 'FinancialAnalyst',
  description: 'Analisa padrões e faz previsões',
  tools: [
    {
      name: 'predict_next_month',
      execute: async () => {
        const last3Months = await getTransactions({ months: 3 });
        
        // Usar Gemini para análise preditiva
        const prompt = `
Com base nestes dados dos últimos 3 meses:
${JSON.stringify(last3Months)}

Faça uma previsão de gastos para o próximo mês por categoria.
Identifique tendências e anomalias.
`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    }
  ]
});
```

---

## 🎨 Melhorias na UI

### 1. **Card de Confirmação de Ações**
```tsx
{pendingAction && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
    <h4 className="font-bold text-yellow-400">⚠️ Confirmação Necessária</h4>
    <p>{pendingAction.message}</p>
    <div className="flex gap-2 mt-3">
      <Button onClick={confirmAction} variant="primary">Confirmar</Button>
      <Button onClick={cancelAction} variant="ghost">Cancelar</Button>
    </div>
  </div>
)}
```

### 2. **Indicador de Processamento Multi-Modal**
```tsx
{isProcessing && (
  <div className="flex items-center gap-2 text-xs text-blue-400">
    <Loader2 className="animate-spin h-3 w-3" />
    <span>
      {processingType === 'ocr' && 'Extraindo dados da imagem...'}
      {processingType === 'audio' && 'Transcrevendo áudio...'}
      {processingType === 'pdf' && 'Analisando PDF...'}
    </span>
  </div>
)}
```

---

## 📊 Métricas e Monitoramento

### Logs de Auditoria
```typescript
await prisma.agentLog.create({
  data: {
    userId,
    action: 'add_transaction',
    input: JSON.stringify(params),
    output: JSON.stringify(result),
    confidence: 0.95,
    requiresConfirmation: false,
    timestamp: new Date()
  }
});
```

### Dashboard de Confiabilidade
- Taxa de acerto do OCR
- Transações confirmadas vs. rejeitadas
- Tempo médio de processamento
- Erros por tipo de entrada

---

## 🚀 Roadmap de Implementação

### Fase 1: Multi-Modal Input (CONCLUÍDO ✅)
1. ✅ Implementar upload de imagem no ChatWidget
2. ✅ Criar endpoint `/api/agent/ocr` com Gemini Vision
3. ✅ Adicionar card de confirmação de dados extraídos
4. ✅ Implementar gravação de áudio
5. ✅ Criar endpoint `/api/agent/process-audio` com Speech-to-Text

### Fase 2: Guardrails e Validação (CONCLUÍDO ✅)
1. ✅ Implementar validação de valores min/max
2. ✅ Adicionar detecção de duplicatas
3. ✅ Criar sistema de confirmação para ações críticas
4. ✅ Implementar rate limiting

### Fase 3: Sub-Agentes ADK (EM ANDAMENTO 🚧)
1. ✅ Migrar para arquitetura de agentes ADK
2. ✅ Criar Financial Agent com tools validados
3. 🚧 Criar Analytics Agent para previsões (Parcial)
4. 🚧 Implementar OCR Agent para processamento de imagens (Integrado no Chat)

### Fase 4: PDF e Análises Avançadas (1-2 semanas)
1. ✅ Implementar upload e parsing de PDF
2. ✅ Criar extração automática de extratos bancários
3. ✅ Adicionar análise preditiva de gastos
4. ✅ Implementar alertas proativos

---

## 🎯 Resultado Esperado

Um assistente financeiro que:
- ✅ **Aceita múltiplos formatos**: texto, voz, foto, PDF
- ✅ **Extrai dados automaticamente** com alta precisão
- ✅ **Valida antes de executar** (guardrails robustos)
- ✅ **Pede confirmação** para ações críticas
- ✅ **Não alucina**: sempre usa dados reais
- ✅ **É auditável**: logs de todas as ações
- ✅ **É inteligente**: aprende padrões e sugere melhorias

---

## 📝 Próximos Passos Imediatos

1. **Qual funcionalidade priorizar?**
   - [ ] OCR de recibos (imagem → transação)
   - [ ] Comando de voz
   - [ ] Upload de extrato PDF
   - [ ] Análise preditiva

2. **Quer que eu implemente alguma agora?**
   - Posso começar pelo OCR de recibos (mais impacto imediato)
   - Ou pelo sistema de confirmação de ações

**O que você prefere implementar primeiro?**
