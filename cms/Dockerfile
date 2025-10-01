# Fase build
FROM node:22-alpine AS build

RUN apk update && apk add --no-cache \
  python3 build-base gcc g++ autoconf automake zlib-dev libpng-dev vips-dev git

# 👇 OJO: para instalar y buildear, usar development
ENV NODE_ENV=development
WORKDIR /opt/app

COPY package*.json ./

# Instala TODAS las deps (incluye dev)
RUN npm install -g node-gyp \
 && npm config set fetch-retry-maxtimeout 600000 -g \
 && npm install

# Copia el código
COPY . .

# Build del admin de Strapi (con devDeps presentes: postcss/autoprefixer)
RUN npm run build

# Ahora sí, quita devDeps para el artefacto final
RUN npm prune --omit=dev

# Fase runtime
FROM node:22-alpine
RUN apk add --no-cache vips-dev

# 👇 En runtime sí es producción
ENV NODE_ENV=production
WORKDIR /opt/app

COPY --from=build /opt/app ./

# Seguridad mínima
RUN chown -R node:node /opt/app
USER node

EXPOSE 1337
CMD ["npm", "run", "start"]
