#!/bin/sh
set -e

# DB dizinini oluştur (volume mount edilmemişse)
mkdir -p /data

# Veritabanı migration'larını uygula
npx prisma migrate deploy

# Uygulamayı başlat
exec npx next start -p 3000
