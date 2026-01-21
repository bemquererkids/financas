# Configuração do Google OAuth

## Problema Atual

O erro `error=Callback` indica que o Google OAuth está configurado, mas o **Callback URL** não está correto no Google Cloud Console.

## Solução

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto (ou crie um novo)

### 2. Configure as Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**
2. Clique em **Criar Credenciais** > **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**

### 3. Configure os URIs de Redirecionamento

**IMPORTANTE:** Adicione EXATAMENTE estas URLs:

#### Para Produção (Railway):
```
https://financas-production-54b6.up.railway.app/api/auth/callback/google
```

#### Para Desenvolvimento Local:
```
http://localhost:3000/api/auth/callback/google
```

### 4. Copie as Credenciais

Após criar, você receberá:
- **Client ID** (algo como: `123456789-abc.apps.googleusercontent.com`)
- **Client Secret** (algo como: `GOCSPX-abc123xyz`)

### 5. Configure as Variáveis de Ambiente

#### No Railway (Produção):
1. Acesse o dashboard do Railway
2. Vá em **Variables**
3. Adicione:
   ```
   GOOGLE_CLIENT_ID=seu_client_id_aqui
   GOOGLE_CLIENT_SECRET=seu_secret_aqui
   ```

#### Localmente (.env):
```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_secret_aqui
```

### 6. Reinicie a Aplicação

- **Railway:** O deploy será feito automaticamente
- **Local:** Reinicie o servidor (`npm run dev`)

## Alternativa: Usar Apenas Email/Senha

Se não quiser configurar o Google OAuth agora, você pode:

1. **Criar conta com email/senha** em `/auth/signup`
2. **Fazer login com email/senha** em `/auth/signin`

O sistema funciona perfeitamente sem o Google OAuth!

## Verificação

Após configurar, teste:
1. Acesse `/auth/signin`
2. Clique em "Continuar com Google"
3. Deve abrir popup do Google para seleção de conta
4. Após autorizar, deve redirecionar para a dashboard

## Troubleshooting

### Erro persiste?
- Verifique se a URL de callback está EXATAMENTE como mostrado acima
- Certifique-se de que as variáveis de ambiente foram salvas
- Aguarde 1-2 minutos para o Railway aplicar as mudanças
- Limpe o cache do navegador (Ctrl+Shift+Del)

### Ainda com problemas?
Use a autenticação por email/senha que está funcionando 100%! 🚀
