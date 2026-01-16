FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache openssl compat-openssl11

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
