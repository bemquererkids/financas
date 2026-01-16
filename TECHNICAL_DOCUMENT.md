# 📘 DOCUMENTO TÉCNICO
**Sistema de Controle Financeiro – Padrão RNV**

**Versão:** 1.0
**Origem:** Planilha “Planilha controle RNV Padrão.xlsx”
**Objetivo:** Replicar fielmente o comportamento financeiro da planilha em um produto digital.

---

## 1. VISÃO GERAL DO PRODUTO
### 1.1 Finalidade
Sistema de controle financeiro pessoal/familiar com:
- **Ledger mensal consolidado**
- **Planejamento orçamentário por envelopes**
- **Controle de pagamentos por janelas**
- **Projeção de investimentos de médio e longo prazo**
- **Painel de desempenho financeiro**
- **Registro de dívidas, objetivos e snapshots por reunião**

---

## 2. PRINCÍPIOS DE NEGÓCIO (IMPORTANTES)
- **Regime mensal (caixa):** Todos os cálculos partem de valores mensais.
- **Fonte da Verdade:** O “Mês a Mês” é a fonte primária.
- **Imutabilidade:** Planejamento e Projeções nunca alteram dados base, apenas leem.
- **Histórico:** É cumulativo e não retroativo.
- **Determinismo:** Cálculos são determinísticos (mesmo input → mesmo output).

---

## 3. MÓDULOS DO SISTEMA

### Módulo A — Ledger Mensal (“Mês a Mês”)
**3.1 Objetivo**
Registrar rendas e despesas por categoria e gerar:
- Totais mensais
- Totais anuais
- Sobra/falta
- Acumulado histórico

**3.2 Entidades**
- **Period**: `id`, `month`, `year`
- **IncomeItem**: `id`, `period_id`, `name`, `amount`
- **ExpenseItem**: `id`, `period_id`, `category`, `subcategory`, `type` (FIXO | VARIAVEL | LAZER | DESCONTO | CARTAO), `amount`, `credit_card_id`

**3.3 Regras de Cálculo**
- **Total de Renda Líquida:** `sum(income_items.amount)`
- **Subtotal por bloco:** `sum(expense_items.amount WHERE type = X)`
- **Total de Custos:** `sum(subtotals of all expense blocks)`
- **Sobra / Falta:** `total_income - total_costs`
- **Acumulado:** `accumulated_result[n] = accumulated_result[n-1] + net_result[n]`

---

### Módulo B — Controle de Pagamentos
**4.1 Objetivo**
Acompanhar contas por janelas de recebimento (Dia 7 / 15 / 30).

**4.2 Entidade**
- **PaymentWindow**: `window_day` (7 | 15 | 30), `received_amount`
- **Payable**: `name`, `amount`, `due_date`

**4.3 Cálculos**
- **Total de Contas:** `sum(payables.amount)`
- **Sobra da Janela:** `received_amount - total_payables`

---

### Módulo C — Planejamento Orçamentário
**5.1 Objetivo**
Transformar histórico financeiro em orçamento ideal vs real.

**5.2 Envelopes Padrão**
| Envelope | Percentual |
| :--- | :--- |
| Contas Fixas | 55% |
| Educação | 10% |
| Reserva Emergência | 10% |
| Aposentadoria | 10% |
| Lazer | 15% |

**5.3 Regras de Cálculo**
- **Renda Mensal:** `ledger.total_income`
- **Média Custos Fixos:** `average(fixed_costs over last 12 months)`
- **Sobra Mensal:** `monthly_income - avg_fixed_costs - leisure_fixed_value`
- **Percentual Real:** `envelope_value / monthly_income`

---

### Módulo D — Projeção de Investimentos
**6.1 Objetivo**
Simular crescimento patrimonial.

**6.2 Inputs**
`initial_balance`, `monthly_contribution`, `annual_return_rate`, `admin_fee_rate`

**6.3 Fórmulas Centrais**
- **Contribuição Anual:** `monthly_contribution * 12`
- **Evolução do Saldo:** `((balance[n-1] + annual_contribution) * (1 + annual_return_rate)) * (1 - admin_fee_rate)`
- **Renda Mensal Projetada:** `(balance[n] * withdrawal_rate) / 12`

---

### Módulo E — Desempenho Financeiro
**7.1 Objetivo**
Painel de leitura rápida: saldo atual, endividamento, simulação.

**7.2 Conversão Taxa**
- `annual_rate = (1 + monthly_rate)^12 - 1`

---

### Módulo F — Dívidas
**Campos:** `name`, `installment_value`, `installment_count`, `settlement_value`, `status`

---

### Módulo G — Objetivos
**Campos:** `meeting_id`, `description`, `status`

---

### Módulo H — Saldos Finais (Snapshots)
**Campos:** `meeting_id`, `date`, `balance`, `total_debt`, `notes`

---

## 9. CRITÉRIOS DE ACEITE
1. Para um mesmo conjunto de inputs, o sistema deve bater **100% com o Excel**.
2. Cálculo de sobra mensal e acumulado deve ser idêntico.
3. Projeções devem respeitar ordem dos cálculos e taxas.
4. Mudança de período não altera histórico.
5. Todos os valores devem ser auditáveis.
