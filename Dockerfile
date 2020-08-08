# Typescript compilation in a build container
FROM node:lts-slim AS build
RUN npm set unsafe-perm true
WORKDIR /app

COPY package*.json lerna.json tsconfig.json ./
RUN npm ci --ignore-scripts

COPY packages ./packages
RUN npm run pack

# Application images
FROM node:lts-slim AS app
ENV NODE_ENV=production PATH="${PATH}:node_modules/.bin"
WORKDIR /app
RUN chown node:node .
USER node

FROM app AS cli
COPY --from=build /app/packages/sds/*.tgz /app/packages/cli/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-cli

FROM app AS server
COPY --from=build /app/packages/sds/*.tgz /app/packages/server/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-server

FROM app AS worker
COPY --from=build /app/packages/sds/*.tgz /app/packages/worker/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-worker
