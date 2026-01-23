# Princípios de Design - MyWallet AI Chat

## 🎯 Regra de Ouro
> **Ferramentas são invisíveis. A conversa é natural. A IA decide quando usar cada tool.**

---

## ✅ O QUE FAZER

### 1. **Conversa Natural em Primeiro Lugar**
```
✅ Usuário: "Gastei 50 reais no mercado"
   → IA detecta intenção e usa tool add_transaction

✅ Usuário: "Quanto vou gastar no próximo mês?"
   → IA busca dados de previsão automaticamente

✅ Usuário: 🎤 "Almoço 35 reais"
   → Transcreve e processa como texto normal
```

### 2. **Inputs Alternativos, Não Features**
- Microfone = forma alternativa de **digitar**
- Câmera = forma alternativa de **inserir dados**
- Não são "funcionalidades" destacadas, são **meios de input**

### 3. **Quick Actions Minimalistas**
- Máximo **2-3 sugestões** para onboarding
- Aparecem **apenas quando o chat está vazio**
- Incluir dica: *"Ou fale naturalmente..."*

### 4. **Zero Poluição Visual**
- Sem menu de opções
- Sem lista de comandos
- Sem botões para cada funcionalidade
- Interface limpa = Input + Mensagens

---

## ❌ O QUE NÃO FAZER

### 1. **Não Criar Botões para Cada Tool**
```
❌ [Análise Preditiva] [Adicionar Gasto] [Ver Saldo] [Categorias]
✅ Input de texto + IA inteligente
```

### 2. **Não Destacar Tecnologia**
```
❌ "🎤 NOVO: Comando de Voz!"
❌ "📸 OCR Avançado com IA!"
✅ Funciona silenciosamente, usuário nem percebe
```

### 3. **Não Forçar Comandos Específicos**
```
❌ "Digite: /adicionar [valor] [categoria]"
✅ "Gastei 50 reais no mercado" (linguagem natural)
```

---

## 📐 Estrutura Ideal do Chat

```
┌─────────────────────────────┐
│  💼 MyWallet                │
│  [X]                        │
├─────────────────────────────┤
│                             │
│  [Mensagens do chat]        │
│                             │
│  👤 Gastei 50 no Uber       │
│  🤖 Registrado! Uber R$50   │
│                             │
├─────────────────────────────┤
│  [📷] [🎤] [Input] [Send]   │
└─────────────────────────────┘
```

**Elementos:**
- 📷 = Câmera (input alternativo)
- 🎤 = Microfone (input alternativo)
- Input = Foco principal
- Send = Ação primária

**Sem:**
- ❌ Menu lateral de ferramentas
- ❌ Abas de funcionalidades
- ❌ Lista de comandos disponíveis

---

## 🧠 Como a IA Decide Usar Tools

A IA analisa a **intenção** do usuário:

| Frase do Usuário | Tool Usado | Invisível para o Usuário |
|------------------|------------|--------------------------|
| "Gastei 50 no Uber" | `add_transaction` | ✅ Sim |
| "Quanto vou gastar?" | `predict_expenses` | ✅ Sim |
| "Qual meu saldo?" | `get_summary` | ✅ Sim |
| 🎤 "Almoço 35" | `speech_to_text` → `add_transaction` | ✅ Sim |
| 📷 [Foto recibo] | `ocr` → `add_transaction` | ✅ Sim |

**Usuário não precisa saber que existem "tools".**

---

## 📱 Alinhamento com o Manifesto

### Do `PRODUCT_MANIFESTO.md`:

> **2.1 "Eu abro e entendo"**
> Em até 5 segundos, o usuário responde: "Estou bem ou estou apertado?"

✅ **Chat limpo** = Entendimento rápido

> **2.3 Linguagem humana, não financeira**
> ❌ "Saldo líquido consolidado"
> ✅ "Dinheiro livre hoje"

✅ **Conversa natural** = Linguagem humana

> **3.2 Ação primária (CTA)**
> Sempre visível: "Adicionar gasto" / "Adicionar renda"

✅ **Input de texto** = CTA sempre visível

---

## 🎨 Exemplos Práticos

### ✅ BOM: Invisível e Natural
```
Usuário abre o chat
→ Vê 2 sugestões simples
→ Digita: "Gastei 120 no supermercado"
→ IA registra automaticamente
→ Responde: "✅ Supermercado R$ 120 registrado!"
```

### ❌ RUIM: Poluído e Técnico
```
Usuário abre o chat
→ Vê 10 botões de funcionalidades
→ Clica em "Adicionar Transação"
→ Preenche formulário
→ Seleciona categoria em dropdown
→ Clica em "Salvar"
```

---

## 🚀 Próximas Implementações

Ao adicionar novas funcionalidades, sempre perguntar:

1. **Precisa de botão?** → Provavelmente não
2. **IA pode detectar automaticamente?** → Sim
3. **Usuário precisa saber que existe?** → Não
4. **Funciona via conversa natural?** → Deve funcionar

---

**Última atualização:** 23/01/2026 00:45
**Baseado em:** `docs/PRODUCT_MANIFESTO.md`
