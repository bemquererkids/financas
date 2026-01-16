# 🚀 Guia de Deploy na Railway

Este guia orienta como colocar o **Financial Control App** online usando a plataforma [Railway](https://railway.app).

## 1. Pré-requisitos
*   Uma conta no [GitHub](https://github.com).
*   Código fonte salvo em um repositório (dê `git push` no seu projeto).
*   Uma conta na [Railway](https://railway.app).

## 2. Configuração do Projeto na Railway

### Passo A: Criar Novo Projeto
1.  Na Railway, clique em **+ New Project**.
2.  Selecione **Deploy from GitHub repo**.
3.  Escolha o repositório `financial-control-app`.
4.  Clique em **Deploy Now**.
    *   *Nota: O primeiro deploy vai falhar porque falta o Banco de Dados e as Variáveis. Isso é normal.*

### Passo B: Adicionar Banco de Dados
1.  No painel do projeto, clique em **+ New** (botão direito superior ou no canvas).
2.  Selecione **Database** -> **PostgreSQL**.
3.  Aguarde o container do Postgres iniciar.

### Passo C: Conectar o Banco
1.  Clique no serviço do seu site (Next.js).
2.  Vá na aba **Settings** -> **Variables**.
3.  Adicione a variável `DATABASE_URL`.
    *   O valor deve ser o *Connection URL* do serviço Postgres que você acabou de criar.
    *   Dica: A Railway costuma injetar isso automaticamente se você linkar os serviços, mas confira. Procura por `${{Postgres.DATABASE_URL}}`.

### Passo D: Outras Variáveis
Adicione as seguintes variáveis na aba **Variables**:

| Variável | Valor | Descrição |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | `sk-...` | Sua chave da OpenAI (mesma do `.env`) |
| `NPM_FLAGS` | `--legacy-peer-deps` | (Opcional) Caso haja conflito de deps |

## 3. Configuração de Build e Start (Importante!)
Para que o Prisma funcione, precisamos rodar as migrations antes de iniciar o app.

1.  Vá em **Settings** do serviço Next.js.
2.  Procure a seção **Build**.
3.  **Build Command**: `npx prisma generate && next build` (Geralmente detectado auto).
4.  **Start Command**: Mude para:
    ```bash
    npx prisma migrate deploy && next start
    ```
    *Isso garante que o banco de produção esteja sempre atualizado com seu schema.*

## 4. Finalizando Integração WhatsApp
1.  Após o deploy ficar verde (Online), copie a URL pública gerada (ex: `https://financial-control-production.up.railway.app`).
2.  Vá na sua **Uazapi** (ou Evolution API).
3.  Atualize o Webhook para: `https://SEU-URL-RAILWAY.app/api/whatsapp`.

🎉 **Pronto!** Seu app está na nuvem e ouvindo mensagens do WhatsApp 24/7.
