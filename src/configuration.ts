import * as os from 'os';
import {
  DefaultAzureCredential,
  ChainedTokenCredential,
  ManagedIdentityCredential,
  EnvironmentCredential,
  TokenCredential,
} from '@azure/identity';
import * as env from 'env-var';

import {
  AzureSqlDatabaseConfiguration,
  DatabaseConfiguration,
  DatabaseMode,
} from './database';

import {
  QueueMode,
  QueueConfiguration,
  AzureStorageQueueConfiguration,
} from './queue';

class AzureCredential {
  private static instance: TokenCredential;

  private constructor() {}

  static getInstance(): TokenCredential {
    if (!AzureCredential.instance) {
      const clientId = env.get('AZURE_CLIENT_ID').asString();

      // DefaultAzureCredential in JS doesn't yet support passing clientId, so we use our own credential as a fallback
      AzureCredential.instance = clientId
        ? new ChainedTokenCredential(
            new EnvironmentCredential(),
            new ManagedIdentityCredential(clientId)
          )
        : new DefaultAzureCredential();
    }
    return AzureCredential.instance;
  }
}

/**
 * Retrieve a QueueConfiguration from the current execution environment.
 */
export function ParseQueueConfiguration(): QueueConfiguration {
  const mode = env
    .get('QUEUE_MODE')
    .default(QueueMode.InMemory)
    .asEnum(Object.values(QueueMode)) as QueueMode;

  const endpoint = env
    .get('QUEUE_ENDPOINT')
    .required(mode !== QueueMode.InMemory)
    .asUrlString();

  // tsc ensures exhaustiveness checking, but tslint thinks it's an error
  // tslint:disable:switch-default
  switch (mode) {
    case QueueMode.Azure:
      const config: AzureStorageQueueConfiguration = {
        mode,
        endpoint,
        credential: AzureCredential.getInstance(),
        shouldCreateQueue: false,
      };

      return config;
    case QueueMode.InMemory:
      return {
        mode: QueueMode.InMemory,
        endpoint: 'http://localhost',
      };
  }
}

/**
 * Retrieve a DatabaseConfiguration from the current execution environment.
 */
export function ParseDatabaseConfiguration(): DatabaseConfiguration {
  const mode = env
    .get('SQL_MODE')
    .default(DatabaseMode.InMemory)
    .asEnum(Object.values(DatabaseMode)) as DatabaseMode;

  const host = env
    .get('SQL_HOST')
    .required(mode !== DatabaseMode.InMemory)
    .asString();

  // tsc ensures exhaustiveness checking, but tslint thinks it's an error
  // tslint:disable:switch-default
  switch (mode) {
    case DatabaseMode.AzureSql:
      const database = env
        .get('SQL_DB')
        .required()
        .asString();

      const config: AzureSqlDatabaseConfiguration = {
        mode,
        host,
        database,
        credential: AzureCredential.getInstance(),
      };

      return config;
    case DatabaseMode.InMemory:
      return {
        mode,
        host: 'localhost',
      };
  }
}

export function ParseLaboratoryConfiguration() {
  const port = env
    .get('PORT')
    .default(3000)
    .asPortNumber();

  let endpointBaseUrl = env.get('LABORATORY_ENDPOINT').asUrlString();

  // if endpoint is not explicitly specified, check for WEBSITE_HOSTNAME and assume HTTPS over 443
  // this variable gets autowired by Azure App Service
  if (!endpointBaseUrl) {
    const hostname = env.get('WEBSITE_HOSTNAME').asString();

    // if not found, fallback to machine hostname
    endpointBaseUrl = hostname
      ? `https://${hostname}`
      : `http://${os.hostname()}:${port}`;
  }

  return {
    endpointBaseUrl,
    blobContainerUrl: env
      .get('BLOB_CONTAINER')
      // TODO: review defaults. We probably want Azure by default, and opt-into "dev mode" via `npm run foo:dev`
      .default('http://blobs')
      .asUrlString(),
    port,
    queue: ParseQueueConfiguration(),
    database: ParseDatabaseConfiguration(),
  };
}
