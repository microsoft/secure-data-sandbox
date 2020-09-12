import { promisify } from 'util';
import * as env from 'env-var';
import { DefaultAzureCredential, TokenCredential } from '@azure/identity';

import {
  QueueMode,
  QueueConfiguration,
  AzureStorageQueueConfiguration,
} from './queue';

const sleep = promisify(setTimeout);

export class AzureCredential {
  private static tokenRetryIntervalMs = 5000;
  private static tokenRetryLimit = 12;

  private static instance: TokenCredential;

  private constructor() {}

  static async getInstance(): Promise<TokenCredential> {
    if (AzureCredential.instance) {
      return AzureCredential.instance;
    }

    const clientId = env.get('AZURE_CLIENT_ID').asString();
    const errors = [];
    for (let i = 0; i < AzureCredential.tokenRetryLimit; i++) {
      try {
        const cred = new DefaultAzureCredential({
          managedIdentityClientId: clientId,
        });
        await cred.getToken('https://management.azure.com/.default');
        AzureCredential.instance = cred;
        return AzureCredential.instance;
      } catch (err) {
        errors.push(err);
        console.log(
          `[${i} of ${AzureCredential.tokenRetryLimit}] Unable to acquire AzureCredential. Retrying in ${AzureCredential.tokenRetryIntervalMs}ms...`
        );
        await sleep(AzureCredential.tokenRetryIntervalMs);
      }
    }

    console.error(
      `Unable to acquire AzureCredential after ${AzureCredential.tokenRetryLimit} attempts`
    );
    throw errors;
  }
}

/**
 * Retrieve a QueueConfiguration from the current execution environment.
 */
export async function ParseQueueConfiguration(): Promise<QueueConfiguration> {
  const mode = env
    .get('QUEUE_MODE')
    .default(QueueMode.InMemory)
    .asEnum(Object.values(QueueMode)) as QueueMode;

  const endpoint = env
    .get('QUEUE_ENDPOINT')
    .required(mode !== QueueMode.InMemory)
    .asUrlString();

  switch (mode) {
    case QueueMode.Azure:
      return {
        mode,
        endpoint,
        credential: await AzureCredential.getInstance(),
        shouldCreateQueue: false,
      } as AzureStorageQueueConfiguration;
    case QueueMode.InMemory:
      return {
        mode: QueueMode.InMemory,
        endpoint: 'http://localhost',
      };
  }
}
