# 🚀 MyWallet - Roadmap de Evolução (SaaS)

## 1. Experiência Mobile First (PWA)
- [ ] **Configurar Manifesto PWA**: Permitir instalação na Home Screen (Android/iOS) com ícone e splash screen nativos.
- [ ] **Service Workers**: Cache offline para visualização básica mesmo sem internet.
- [ ] **Push Notifications**: Sistema de lembretes ativos.
    - [ ] Cron Job diário (ex: 9h da manhã).
    - [ ] Regra: Avisar 3 dias antes, 1 dia antes e no dia do vencimento.

## 2. Automação e Facilidade (OFX)
- [ ] **Parser de OFX**: Criar utilitário para ler arquivos `.ofx` (padrão bancário).
- [ ] **Conciliação Inteligente**:
    - [ ] Usuário sobe o arquivo.
    - [ ] Sistema verifica duplicatas (já cadastradas).
    - [ ] **IA Categorizer**: A IA analisa a descrição ("Uber *123") e define automaticamente a categoria ("Transporte").

## 3. Modelo de Negócios (Freemium)
### Plano Gratuito (Basic)
- Controle manual de gastos.
- Visualização de saldo e metas simples.
- Sem acesso ao Chat Inteligente.
- Acesso Web/PWA básico.

### Plano Premium (Advisor)
- **Consultor IA Ilimitado**: Chat contextual, dicas de investimento, análise de perfil.
- **Automação Bancária**: Importação OFX ilimitada com categorização automática.
- **Relatórios Avançados**: Projeção de patrimônio (aquele gráfico que criamos!), análise de humor financeiro.
- **Notificações Push**: Lembretes de contas.

## 4. Infraestrutura Necessária
- [ ] Campo `subscriptionTier` na tabela `User` (FREE | PRO).
- [ ] Integração com Gateway de Pagamento (ex: Stripe ou Asaas) para gerenciar o upgrade.
- [ ] Middleware para bloquear rotas `/api/chat` para usuários FREE.
