# Usar imagem Node.js leve e compatível
FROM node:18-bullseye-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma (openssl)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# 1. Copiar apenas arquivos de dependência primeiro (para aproveitar cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar dependências
RUN npm install

# 3. Copiar o restante do código fonte
COPY . .

# 4. Gerar Prisma Client
RUN npx prisma generate

# 5. Construir a aplicação Next.js
# Isso vai criar a pasta .next que estava faltando
RUN npm run build

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar com logging verbose
CMD sh -c "echo '🚀 Starting migrations...' && \
    npx prisma migrate deploy && \
    echo '✅ Migrations complete!' && \
    echo '🌐 Starting Next.js server on port 3000...' && \
    exec npm run start"

