# Fase build
FROM node:22-alpine AS build
#dependencias nativas
RUN apk update && apk add --no-cache python3 build-base gcc g++ autoconf automake zlib-dev libpng-dev vips-dev git  > /dev/null 2>&1

WORKDIR /opt/app

# Aprovecha caché: primero manifiestos
COPY package*.json ./

ENV NODE_ENV=production

# Instala TODAS las dependencias (incluye dev)
RUN npm install

# Copia el código
COPY . .

# Compila el admin de Strapi
RUN npm run build

# Prunea dev deps para dejar node_modules "prod only"
#RUN npm prune --omit=dev

# -Fase runtime
FROM node:22-alpine

# Libvips runtime para sharp
RUN apk add --no-cache vips-dev

ENV NODE_ENV=production
WORKDIR /opt/app

# Copiamos todo lo ya compilado y node_modules ya pruneados
COPY --from=build /opt/app ./

# Seguridad: no root
RUN chown -R node:node /opt/app
USER node

EXPOSE 1337
CMD ["npm", "run", "start"]
