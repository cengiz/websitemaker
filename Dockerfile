FROM node:20-slim

WORKDIR /app

# better-sqlite3 native modülü için derleme araçları
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Önce bağımlılıkları kopyala (layer cache için)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

# Kaynak kodun geri kalanını kopyala
COPY . .

# Prisma client üret
RUN npx prisma generate

# Next.js production build
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "mkdir -p /data && npx prisma migrate deploy && npx next start -p 3000"]
