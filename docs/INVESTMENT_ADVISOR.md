# 💰 Investment Advisor - Agente de Investimentos

## 🎯 Como Funciona (Invisível para o Usuário)

O usuário simplesmente **conversa naturalmente** com a IA:

```
👤 "Quero investir meu dinheiro, o que fazer?"
👤 "Tenho R$ 5.000, onde aplicar?"
👤 "Como diversificar minha carteira?"
👤 "Qual o melhor investimento para iniciante?"
```

A IA **detecta a intenção** e fornece recomendações personalizadas baseadas em:
- Renda mensal do usuário
- Gastos médios (últimos 3 meses)
- Investimentos atuais
- Perfil de risco (conservador/moderado/arrojado)

---

## 📊 Perfis de Investimento

### 🛡️ **Conservador**
**Prioridade:** Segurança e liquidez

**Alocação Sugerida:**
- 40% Reserva de Emergência (Tesouro Selic, CDB liquidez diária)
- 50% Renda Fixa (CDB, LCI/LCA, Tesouro IPCA+)
- 10% Fundos Conservadores (Fundos DI)

**Perfil ideal para:**
- Iniciantes em investimentos
- Quem precisa de liquidez
- Baixa tolerância a risco

---

### ⚖️ **Moderado**
**Prioridade:** Equilíbrio entre segurança e crescimento

**Alocação Sugerida:**
- 25% Reserva de Emergência
- 40% Renda Fixa
- 25% Renda Variável (ETFs, Ações blue chips)
- 10% Fundos Imobiliários (FIIs)

**Perfil ideal para:**
- Quem já tem reserva de emergência
- Horizonte de 3-5 anos
- Aceita alguma volatilidade

---

### 🚀 **Arrojado**
**Prioridade:** Máximo crescimento no longo prazo

**Alocação Sugerida:**
- 15% Reserva de Emergência
- 25% Renda Fixa
- 45% Renda Variável (Ações growth, ETFs internacionais)
- 15% Alternativos (FIIs, Cripto, Multimercado)

**Perfil ideal para:**
- Investidores experientes
- Horizonte de 5+ anos
- Alta tolerância a volatilidade

---

## 🎓 Recomendações por Situação

### **"Nunca investi, por onde começar?"**
```
1. Monte reserva de emergência (3-6 meses de despesas)
   → Tesouro Selic ou CDB com liquidez diária

2. Abra conta em corretora (XP, Rico, Clear, BTG)

3. Comece com Renda Fixa
   → CDB 100%+ CDI
   → Tesouro IPCA+ (longo prazo)

4. Estude sobre Renda Variável
   → ETFs (BOVA11, IVVB11) são mais seguros que ações individuais
```

### **"Tenho R$ 10.000, onde investir?"**
```
Perfil Moderado:
- R$ 3.000 → Tesouro Selic (reserva)
- R$ 4.000 → CDB/LCI (renda fixa)
- R$ 2.000 → ETF BOVA11 (renda variável)
- R$ 1.000 → FII (renda passiva)
```

### **"Como diversificar?"**
```
Regra de Ouro: Não coloque todos os ovos na mesma cesta

1. Diversifique entre classes de ativos
   → Renda Fixa + Renda Variável + FIIs

2. Dentro de cada classe, diversifique
   → Várias ações, vários FIIs, vários CDBs

3. Diversifique no tempo
   → Aportes mensais (dollar-cost averaging)
```

---

## ⚠️ Avisos e Guardrails

### **Sempre Mencionar:**
1. ✅ Reserva de emergência é PRIORIDADE
2. ✅ Rentabilidade passada não garante rentabilidade futura
3. ✅ Diversificação reduz risco
4. ✅ Investir é para longo prazo (5+ anos)

### **Nunca Fazer:**
1. ❌ Prometer rentabilidade garantida
2. ❌ Dar dicas de ações específicas ("compre PETR4")
3. ❌ Incentivar day trade
4. ❌ Recomendar criptomoedas como investimento principal
5. ❌ Pressionar para investir sem reserva de emergência

---

## 🔗 API Endpoint

**Rota:** `/api/agent/invest`

**Método:** POST

**Body:**
```json
{
  "amount": 5000,
  "timeHorizon": "longo",
  "riskTolerance": "moderado"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "monthlyIncome": 8000,
    "monthlyExpenses": 5000,
    "availableToInvest": 5000,
    "currentInvestments": 10000,
    "riskProfile": "moderado"
  },
  "recommendations": {
    "allocation": [
      {
        "category": "Reserva de Emergência",
        "percentage": 25,
        "amount": 1250,
        "description": "Base de segurança",
        "examples": ["Tesouro Selic", "CDB liquidez diária"]
      },
      // ...
    ],
    "reasoning": "Perfil moderado equilibra...",
    "nextSteps": ["1. Garanta reserva...", "2. Comece com ETFs..."],
    "warnings": ["⚠️ Renda variável tem volatilidade..."]
  }
}
```

---

## 💬 Exemplos de Conversas

### **Exemplo 1: Iniciante**
```
👤 "Nunca investi, tenho medo de perder dinheiro"

🤖 "Entendo! Vamos começar com segurança:

1. Primeiro, você tem reserva de emergência? 
   (3-6 meses de despesas em investimento líquido)

2. Se não, comece por aí:
   → Tesouro Selic (100% seguro, rende ~100% do CDI)
   → Resgate quando quiser

3. Depois, podemos falar de CDB e Tesouro IPCA+

Quanto você consegue guardar por mês?"
```

### **Exemplo 2: Intermediário**
```
👤 "Tenho R$ 20.000 parados na poupança"

🤖 "Ótimo que está guardando! Mas a poupança rende pouco (~70% do CDI).

Sugestão de migração:
- R$ 6.000 → Tesouro Selic (reserva de emergência)
- R$ 8.000 → CDB 110% CDI ou Tesouro IPCA+ 2029
- R$ 4.000 → ETF BOVA11 (bolsa diversificada)
- R$ 2.000 → FII (renda passiva mensal)

Seu perfil é mais conservador ou aceita algum risco?"
```

### **Exemplo 3: Avançado**
```
👤 "Quero diversificar internacionalmente"

🤖 "Boa estratégia! Opções no Brasil:

1. ETFs internacionais (BDRs):
   → IVVB11 (S&P 500)
   → NASD11 (Nasdaq)

2. Fundos Multimercado com exposição global

3. Criptomoedas (máximo 5-10% da carteira):
   → BTC, ETH via exchanges brasileiras

Recomendo: 70% Brasil, 30% Internacional
Qual seu horizonte de tempo?"
```

---

## 📚 Recursos Educacionais (Mencionar quando relevante)

- **Corretoras:** XP, Rico, Clear, BTG, Nubank
- **Tesouro Direto:** tesouro.gov.br
- **Educação:** Canal do Holder, Primo Rico (YouTube)
- **Comparação:** Renda Fixa Bank (comparar CDBs)

---

## 🎯 Integração com o Chat

A IA **automaticamente** detecta perguntas sobre investimento e:

1. Analisa o perfil financeiro do usuário
2. Sugere alocação personalizada
3. Explica cada categoria
4. Dá próximos passos práticos
5. Alerta sobre riscos

**Tudo de forma conversacional, sem menus ou formulários.**

---

**Última atualização:** 23/01/2026 00:50
