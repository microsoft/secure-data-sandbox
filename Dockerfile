FROM node:lts-slim AS build
ENV PATH="${PATH}:node_modules/.bin"
RUN npm set unsafe-perm true

WORKDIR /app
COPY package*.json lerna.json tsconfig*.json ./
RUN npm ci --ignore-scripts

# Node packages
FROM build AS build-sds
COPY packages/sds ./packages/sds
RUN lerna bootstrap --ci --ignore-scripts \
  && cd packages/sds \
  && npm pack

FROM build-sds AS build-laboratory
COPY packages/laboratory ./packages/laboratory
RUN lerna bootstrap --ci --ignore-scripts \
  && cd packages/laboratory \
  && npm pack

FROM build-sds AS build-worker
COPY packages/worker ./packages/worker
RUN lerna bootstrap --ci --ignore-scripts \
  && cd packages/worker \
  && npm pack

FROM build-sds AS build-cli
COPY packages/cli ./packages/cli
RUN lerna bootstrap --ci --ignore-scripts \
  && cd packages/cli \
  && npm pack

# Application images
FROM node:lts-slim AS app
ENV NODE_ENV=production PATH="${PATH}:node_modules/.bin"
WORKDIR /app
RUN chown node:node .
USER node

FROM app AS laboratory
COPY --from=build-laboratory /app/packages/sds/*.tgz /app/packages/laboratory/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-laboratory

FROM app AS worker
COPY --from=build-worker /app/packages/sds/*.tgz /app/packages/worker/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-worker

FROM app AS cli
COPY --from=build-cli /app/packages/sds/*.tgz /app/packages/cli/*.tgz /packages/
RUN npm install /packages/*.tgz
CMD sds-cli
