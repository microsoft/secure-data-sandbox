import {
  DefaultAzureCredential,
  ChainedTokenCredential,
  ManagedIdentityCredential,
  EnvironmentCredential,
} from '@azure/identity';
import * as env from 'env-var';

import {
  AzureSqlDatabaseConfiguration,
  DatabaseConfiguration,
  DatabaseMode,
} from './database';
import { QueueMode, QueueConfiguration } from './queue';

/**
 * Retrieve a QueueConfiguration from the current execution environment.
 */
export function ParseQueueConfiguration(): QueueConfiguration {
  const mode = env
    .get('QUEUE_MODE')
    .default(QueueMode.Azure)
    .asEnum(Object.values(QueueMode)) as QueueMode;

  const endpoint = env
    .get('QUEUE_ENDPOINT')
    .required()
    .asUrlString();

  return {
    mode,
    endpoint,
  };
}

/**
 * Retrieve a DatabaseConfiguration from the current execution environment.
 */
export function ParseDatabaseConfiguration(): DatabaseConfiguration {
  const mode = env
    .get('SQL_MODE')
    .default(DatabaseMode.AzureSql)
    .asEnum(Object.values(DatabaseMode)) as DatabaseMode;

  const host = env
    .get('SQL_HOST')
    .required()
    .asString();

  // tsc ensures exhaustiveness checking, but tslint thinks it's an error
  // tslint:disable:switch-default
  switch (mode) {
    case DatabaseMode.AzureSql:
      const database = env
        .get('SQL_DB')
        .required()
        .asString();

      const clientId = env.get('AZURE_CLIENT_ID').asString();

      // DefaultAzureCredential in JS doesn't yet support passing clientId, so we use our own credential as a fallback
      const credential = clientId
        ? new ChainedTokenCredential(
            new EnvironmentCredential(),
            new ManagedIdentityCredential(clientId)
          )
        : new DefaultAzureCredential();

      const config: AzureSqlDatabaseConfiguration = {
        mode,
        host,
        database,
        credential,
      };

      return config;
  }
}
