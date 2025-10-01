# Fase build
FROM node:22-alpine AS build
#dependencias nativas
RUN apk update && apk add --no-cache python3 build-base gcc g++ autoconf automake zlib-dev libpng-dev vips-dev git  > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/

# Aprovecha caché: primero manifiestos
COPY package*.json ./

ENV NODE_ENV=production

# Instala TODAS las dependencias (incluye dev)
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
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

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/

# Copiamos todo lo ya compilado y node_modules ya pruneados
COPY --from=build /opt/node_modules ./node_modules

WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV PATH=/opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node

EXPOSE 1337
CMD ["npm", "run", "start"]
