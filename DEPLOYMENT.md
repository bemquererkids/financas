# Guia de Deploy (Produção) 🚀

Para subir sua aplicação para produção (Internet), recomendamos usar a **Vercel** com um banco de dados **Postgres (Neon ou Vercel Storage)**.

## 1. Preparar o Código
O código já foi salvo (commitado). Agora você precisa enviá-lo para o GitHub.
```bash
git push origin main
```

## 2. Configurar Banco de Dados na Nuvem
Como seu banco local (`localhost`) não funciona na nuvem, você precisa de um banco online.
Recomendamos o **Neon.tech** (Grátis) ou **Vercel Postgres**.

1.  Crie um projeto no [Neon.tech](https://neon.tech).
2.  Copie a **Connection String** (ex: `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb...`).

## 3. Deploy na Vercel
1.  Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2.  Importe o repositório `financial-control-app`.
3.  Nas configurações de **Environment Variables**, adicione:
    *   `DATABASE_URL`: Cole a string do Neon/Postgres aqui.
    *   `NEXTAUTH_SECRET`: Gere um segredo (pode ser qualquer string longa aleatória).
    *   `NEXTAUTH_URL`: Coloque a URL que a Vercel gerar (ex: `https://seu-app.vercel.app`) - *Nota: No primeiro deploy pode deixar em branco ou por localhost, mas depois atualize*.
    *   `GOOGLE_GENERATIVE_AI_API_KEY`: Sua chave do Gemini.

## 4. Rodar Migrations na Produção
Assim que o deploy terminar (ou durante o build), o banco de produção precisa receber as tabelas.
No seu terminal local, aponte para o banco de produção e envie o schema:

```bash
# Temporariamente aponte para o banco de produção
export DATABASE_URL="sua-url-do-neon-aqui"
npx prisma db push
```

Ou configure o comando de Build na Vercel para:
`npx prisma generate && npx prisma db push && next build`

## Checklist Final
- [ ] Banco de dados criado na nuvem.
- [ ] Variáveis de ambiente configuradas na Vercel.
- [ ] Schema sincronizado (`db push`).
