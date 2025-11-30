# ===== STAGE 1: Builder =====
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar frontend (genera /dist)
RUN npm run build

# ===== STAGE 2: Producción =====
FROM nginx:alpine

# Copiar archivos compilados al root del servidor web
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto interno del nginx del frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]