# Typescript compilation in a build container
FROM node:lts-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json .
COPY src src
RUN npm run compile

# Run as a nonprivileged user in production mode
FROM node:lts-slim AS app
ENV NODE_ENV=production
WORKDIR /app

RUN chown node:node .
USER node

COPY --from=build /app/package*.json ./
RUN npm install

COPY --from=build /app/build/src /app/build/src

# Custom targets for specific entrypoints
FROM app AS worker
CMD npm run worker
