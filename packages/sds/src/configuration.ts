import { promisify } from 'util';
import * as env from 'env-var';
import {
  DefaultAzureCredential,
  ManagedIdentityCredential,
  TokenCredential,
} from '@azure/identity';

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

    // Retry loop is a workaround for usage with aad-pod-identity, where the identity is not
    // mounted to the VMSS within 500ms, triggering a lockout that renders the credential
    // object unable to be used. We keep trying until we get a valid token or timeout
    for (let i = 0; i < AzureCredential.tokenRetryLimit; i++) {
      try {
        return await AzureCredential.initCredential(clientId);
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

  private static async initCredential(clientId?: string) {
    // DefaultAzureCredential currently fails when trying to get tokens for a User-Assigned Identity when deployed
    // to Azure App Service. https://github.com/Azure/azure-sdk-for-js/issues/11595
    // When this Issue is resolved, we should remove the try/catch and only use DefaultAzureCredential
    try {
      const cred = new DefaultAzureCredential({
        managedIdentityClientId: clientId,
      });
      await cred.getToken('https://management.azure.com/.default');
      AzureCredential.instance = cred;
      return AzureCredential.instance;
    } catch (err) {
      // If DefaultAzureCredential has failed and there's no clientId - throw the original error
      if (!clientId) {
        throw err;
      }

      // Workaround for https://github.com/Azure/azure-sdk-for-js/issues/11595
      // Exceptions here should be allowed to throw
      const cred = new ManagedIdentityCredential(clientId);
      await cred.getToken('https://management.azure.com/.default');
      AzureCredential.instance = cred;
      return AzureCredential.instance;
    }
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
