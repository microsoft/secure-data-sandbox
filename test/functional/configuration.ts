import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient } from '@azure/storage-queue';
import * as env from 'env-var';
import { v1 } from 'uuid';
import {
  AzureStorageQueueConfiguration,
  GetQueue,
  QueueMode,
} from '../../src/queue';

export function getQueueConfiguration<T>() {
  const serviceUrl = env
    .get('TEST_QUEUE_SERVICE_URL')
    .required()
    .asUrlString();
  const credential = new DefaultAzureCredential();
  const queueEndpoint = `${serviceUrl}${v1()}`;
  const config: AzureStorageQueueConfiguration = {
    mode: QueueMode.Azure,
    endpoint: queueEndpoint,
    credential,
    shouldCreateQueue: true,
  };

  return {
    client: new QueueClient(queueEndpoint, credential),
    queue: GetQueue<T>(config),
  };
}

export function getDockerBaseVolumePath(): string {
  return env
    .get('TEST_BASE_VOLUME_PATH')
    .required()
    .asString();
}
