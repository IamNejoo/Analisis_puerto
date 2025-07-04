# Etapa de desarrollo
FROM node:18-alpine AS development

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar archivos de configuración
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY .eslintrc* ./

# Copiar el código fuente
COPY public ./public
COPY src ./src

# Exponer puerto de Vite
EXPOSE 5173

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Etapa de construcción
FROM node:18-alpine AS build

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias desde la etapa de desarrollo
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar todos los archivos necesarios para el build
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]