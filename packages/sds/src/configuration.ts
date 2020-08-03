import * as env from 'env-var';

import {
  DefaultAzureCredential,
  ChainedTokenCredential,
  ManagedIdentityCredential,
  EnvironmentCredential,
  TokenCredential,
} from '@azure/identity';

import {
  QueueMode,
  QueueConfiguration,
  AzureStorageQueueConfiguration,
} from './queue';

export class AzureCredential {
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
      return {
        mode,
        endpoint,
        credential: AzureCredential.getInstance(),
        shouldCreateQueue: false,
      } as AzureStorageQueueConfiguration;
    case QueueMode.InMemory:
      return {
        mode: QueueMode.InMemory,
        endpoint: 'http://localhost',
      };
  }
}
