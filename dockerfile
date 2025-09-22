# -----------------
# Base stage
# -----------------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# -----------------
# Dev stage
# -----------------
FROM base AS dev
RUN npm install
COPY prisma ./prisma
COPY src ./src
CMD ["npm", "run", "dev"]

# -----------------
# Build stage
# -----------------
FROM base AS build
WORKDIR /app
RUN npm ci
COPY . .
# Генерация Prisma Client без подключения к базе
RUN npx prisma generate
RUN npm run build

# -----------------
# Prod stage
# -----------------
FROM node:20-alpine AS prod
WORKDIR /app

# Копируем собранное приложение и runtime-зависимости
COPY --from=build /app/package*.json ./
COPY --from=build /app/src/openapi.json ./openapi.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/build ./build

# Генерация Prisma Client для runtime (без подключения к БД)
RUN npx prisma generate

# Применение миграций и старт приложения в runtime
CMD ["sh", "-c", "npx prisma migrate deploy && node build/main.js"]
