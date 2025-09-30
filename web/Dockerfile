FROM node:22-alpine AS build

WORKDIR /opt/app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm install

COPY . .

RUN npx prisma migrate deploy
RUN npx prisma generate

RUN npm run build

#fase runtime
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /opt/app

COPY --from=build /opt/app ./

RUN chown -R node:node /opt/app
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]