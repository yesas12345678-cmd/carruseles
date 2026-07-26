# Dockerfile optimizado para Dokploy (Next.js + Puppeteer Chromium + FFmpeg + Cron Scheduler)
FROM node:20-slim

# Instalar dependencias necesarias para Puppeteer y FFmpeg en Linux
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt-get/lists/*

# Configurar variable de entorno para Puppeteer para usar el Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copiar manifiesto de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Crear carpetas de exportación si no existen
RUN mkdir -p export public/export

# Exponer el puerto de Next.js
EXPOSE 3000

# Script de arranque: inicia Next.js dev/prod y el programador cron
CMD ["sh", "-c", "npm run dev & npm run scheduler"]
