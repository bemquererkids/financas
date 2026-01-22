# MyWallet – Princípios de Negócio, UX e Jornada do Usuário

Este documento consolida **as diretrizes essenciais de negócio e experiência do usuário** para o aplicativo **MyWallet**, servindo como **referência oficial** para ajustes e evolução do produto já desenvolvido pelo Antigravity.

---

## MANIFESTO DO PRODUTO – MYWALLET

### O que é um Manifesto de Produto

Um **manifesto de produto** é um documento curto, direto e inspiracional que define:

* a crença central do produto
* o problema humano que ele resolve
* o comportamento esperado da ferramenta

Ele **não descreve funcionalidades**, descreve **postura, intenção e identidade**.

O manifesto é usado para:

* alinhar decisões difíceis
* evitar feature creep
* garantir coerência de UX ao longo do tempo

---

### Manifesto MyWallet

**MyWallet existe para devolver consciência ao dinheiro.**

Dinheiro não é apenas número.
É tempo, decisão, ansiedade, liberdade e responsabilidade.

MyWallet não julga.
MyWallet não confunde.
MyWallet não esconde.

Ele mostra a verdade financeira de forma simples, humana e acionável.

MyWallet não pergunta quanto você ganha.
Ele pergunta se você sabe o que já está comprometido.

Não promete enriquecer.
Promete clareza.

Não empurra investimentos.
Mostra quando faz sentido investir.

Não controla o usuário.
Devolve controle ao usuário.

Abrir o MyWallet deve gerar apenas uma sensação:

> **"Agora eu sei onde estou."**

Se o usuário fecha o app mais confuso do que abriu, o MyWallet falhou.

---

## 1. Propósito do Produto

**MyWallet não é um banco, não é uma planilha e não é uma corretora.**

MyWallet é a **carteira digital de decisão** do usuário.

> O lugar onde a pessoa abre o app e entende, sem esforço:
>
> * quanto dinheiro realmente tem
> * quanto já está comprometido
> * se pode ou não gastar agora

O produto existe para gerar **clareza, confiança e decisão**.

---

## 2. O Que NÃO Pode Faltar (Visão de Negócio)

### 2.1 Fonte Única da Verdade

* Deve existir **um saldo central confiável**
* Esse saldo sempre precisa ser explicável
* Nenhum número pode parecer “mágico”

> Todo valor exibido deve responder à pergunta: *"De onde isso veio?"*

---

### 2.2 Separação Clara de Tempo

O app deve distinguir explicitamente:

* **Passado** – o que já aconteceu
* **Presente** – dinheiro disponível agora
* **Futuro comprometido** – contas certas
* **Projeções** – cenários possíveis

Misturar esses conceitos gera confusão e quebra confiança.

---

### 2.3 Consciência de Compromissos

MyWallet não é sobre “gastar menos”.

É sobre **saber o que já tem destino**.

O app deve sempre deixar claro:

* Quanto do dinheiro já está comprometido
* Quanto é realmente livre

---

### 2.4 Tempo como Eixo Central

Não basta saber *quanto*, é essencial saber *quando*.

O produto precisa responder com clareza:

* O que vence até o fim do mês
* O que vence nos próximos 7 / 15 / 30 dias
* Como ficará o saldo após esses eventos

---

### 2.5 Todo Número Deve Levar a uma Decisão

Se um dado não ajuda o usuário a decidir algo, ele é secundário.

Exemplos de decisões:

* Posso gastar?
* Preciso segurar?
* Posso investir?
* Estou no limite?

---

## 3. Princípios de UX (Norte do Produto)

### 3.1 Regra dos 5 Segundos

Em até **5 segundos**, ao abrir o app, o usuário precisa entender:

> “Estou bem ou estou apertado?”

Sem scroll. Sem gráfico complexo.

---

### 3.2 Nenhuma Tela Pode Parecer uma Planilha

* Planilhas são para cálculo
* UX é para **entendimento emocional**

Preferir:

* Cards
* Barras de progresso
* Cores semânticas
* Texto humano

---

### 3.3 Linguagem Humana

Evitar termos técnicos.

Usar linguagem cotidiana:

* “O que sobrou esse mês”
* “Dinheiro livre hoje”
* “Compromissos até o dia 30”

---

### 3.4 Feedback Imediato

Toda ação do usuário deve mostrar impacto.

Exemplo:

> “Adicionar essa conta reduz seu dinheiro livre em R$ 420”

---

### 3.5 Fricção Inteligente

Algumas ações precisam de reflexão:

* Estourar orçamento
* Usar reserva
* Ignorar compromissos

O app não proíbe, **questiona**:

> “Isso afeta sua meta. Deseja continuar?”

---

## 4. Jornada Intuitiva do Usuário

### 4.1 Home = A Carteira

A tela inicial é a **carteira aberta na mão**.

Deve mostrar imediatamente:

1. Dinheiro disponível agora
2. Compromissos até o próximo recebimento
3. Estado emocional (OK / Atenção / Risco)

Exemplo conceitual:

```
Dinheiro livre hoje
R$ 3.420

Compromissos até 30/03
R$ 2.180

✔ Você está no controle
```

---

### 4.2 Ação Primária Sempre Visível

* Adicionar gasto
* Adicionar renda

Nunca esconder em menus profundos.

---

### 4.3 Timeline Financeira (História, não Extrato)

Ao tocar no saldo, o usuário vê uma **história simples**:

* Recebi salário
* Paguei aluguel
* Paguei cartão
* Sobrou X

---

### 4.4 Planejamento com Nome Humano

Evitar “Planejamento Financeiro”.

Sugestões:

* “Para onde vai meu dinheiro”
* “Distribuição mensal”

Visual com envelopes e barras de progresso.

---

### 4.5 Investimentos como Futuro Tangível

Mostrar primeiro impacto, não tabela:

* “Mantendo esse ritmo, em 10 anos você terá R$ X”
* “Isso pode gerar R$ Y por mês”

Detalhes ficam em segundo nível.

---

### 4.6 Dívidas como Progresso

Dívida deve gerar alívio, não culpa.

Exemplo visual:

```
Financiamento do carro
██████████░░░░ 68%
Faltam 14 parcelas
```

---

## 5. Fazer Jus ao Nome: MyWallet

### 5.1 Metáfora Central

* Carteira = o que eu tenho agora
* Tudo gira em torno da pergunta:

> “Posso tirar esse dinheiro daqui sem me prejudicar?”

---

### 5.2 Estados Emocionais Claros

A carteira precisa "sentir":

* 🟢 Confortável
* 🟡 Apertada
* 🔴 No limite

Esses estados afetam cores, mensagens e sugestões.

---

### 5.3 Memória Curta por Padrão

O foco principal é:

* Hoje
* Este mês
* Próximo mês

Histórico profundo fica acessível, mas não dominante.

---

### 5.4 Confiança Absoluta

Sem confiança, o produto morre.

Portanto:

* Sempre explicar números
* Sempre permitir ver como foi calculado
* Nunca recalcular passado sem avisar

---

## 6. Frase Norte do Produto

> **MyWallet é o lugar onde o usuário abre o app e sabe, sem esforço, se pode gastar, quanto pode gastar e o que acontece se gastar.**

Se uma funcionalidade não reforça isso, ela é secundária.

---

## 7. Critérios de UX (Checklist de Validação)

Os critérios abaixo devem ser usados como **checklist obrigatório** para validar qualquer tela, fluxo ou ajuste no MyWallet.

---

### 7.1 Clareza Imediata

Objetivo: o usuário deve entender **como está sua vida financeira agora** em até 5 segundos.

Checklist:

* [ ] Existe **um número principal** claramente destacado?
* [ ] Esse número responde à pergunta: *"quanto eu posso usar agora?"*
* [ ] O estado emocional está explícito (ex.: confortável / atenção / risco)?
* [ ] Não exige scroll para entender o essencial?

Falha comum:

* Mostrar muitos números sem hierarquia.
* Obrigar o usuário a interpretar gráficos.

---

### 7.2 Contexto Explícito

Objetivo: nenhum número pode parecer arbitrário ou mágico.

Checklist:

* [ ] Todo valor tem uma explicação acessível (tooltip, detalhe, drill-down)?
* [ ] O usuário consegue entender *de onde veio* o número?
* [ ] Passado, presente e futuro não estão misturados?
* [ ] Projeções estão claramente marcadas como projeções?

Falha comum:

* Mostrar saldo futuro como se fosse dinheiro disponível.

---

### 7.3 Ação Clara

Objetivo: cada tela deve induzir **uma decisão clara**, mesmo que implícita.

Checklist:

* [ ] A tela responde implicitamente a uma pergunta do usuário?
* [ ] Existe um próximo passo óbvio?
* [ ] O CTA principal está visível sem esforço?
* [ ] O usuário sabe o que fazer depois de olhar a tela?

Falha comum:

* Telas informativas que não levam a ação alguma.

---

### 7.4 Linguagem Humana

Objetivo: o app deve conversar com pessoas, não com contadores.

Checklist:

* [ ] Evita termos técnicos ou financeiros?
* [ ] Usa frases curtas e naturais?
* [ ] Um usuário leigo entenderia sem ajuda externa?
* [ ] O texto soa como alguém explicando, não como relatório?

Falha comum:

* Usar jargão financeiro achando que passa credibilidade.

---

### 7.5 Fricção Inteligente

Objetivo: proteger o usuário de decisões impulsivas sem bloquear ações.

Checklist:

* [ ] Gastos fora do planejado geram alerta?
* [ ] Uso de reserva exige confirmação consciente?
* [ ] O impacto financeiro é mostrado antes da confirmação?
* [ ] O tom é neutro, sem julgamento?

Falha comum:

* Ou não alertar nada, ou alertar demais e gerar fadiga.

---

### 7.6 Confiança

Objetivo: o usuário precisa confiar no MyWallet como confia na própria carteira.

Checklist:

* [ ] O histórico nunca muda sem aviso?
* [ ] Alterações deixam rastro (auditoria)?
* [ ] O usuário consegue revisar cálculos?
* [ ] Projeções não se passam por realidade?

Falha comum:

* Recalcular passado silenciosamente.

---

### 7.7 Mobile First Real

Objetivo: o app deve funcionar perfeitamente em uso rápido, com uma mão.

Checklist:

* [ ] Conteúdo principal aparece sem scroll?
* [ ] Botões principais são acessíveis com o polegar?
* [ ] Hierarquia visual clara em telas pequenas?
* [ ] Textos legíveis sem zoom?

Falha comum:

* Projetar primeiro para desktop e adaptar depois.

* [ ] A tela funciona perfeitamente com uma mão?

* [ ] O conteúdo principal aparece sem scroll?

* [ ] A hierarquia visual é clara em telas pequenas?

---

## 8. Uso Deste Documento

Este arquivo deve ser utilizado como:

* Referência de produto
* Guia de UX
* Critério de decisão em ajustes futuros
* Base para alinhamento com o Antigravity

Ele descreve *como o MyWallet deve se comportar*, independentemente da tecnologia usada.
