import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient } from '@azure/storage-queue';
import * as env from 'env-var';
import { v1 } from 'uuid';
import { GetQueue, QueueMode } from '../../src/queue';

export function getQueueConfiguration<T>() {
  const serviceUrl = env
    .get('TEST_QUEUE_SERVICE_URL')
    .required()
    .asUrlString();
  const credential = new DefaultAzureCredential();
  const queueEndpoint = `${serviceUrl}${v1()}`;

  return {
    client: new QueueClient(queueEndpoint, credential),
    queue: GetQueue<T>({
      mode: QueueMode.Azure,
      endpoint: queueEndpoint,
    }),
  };
}

export function getDockerBaseVolumePath(): string {
  return env
    .get('TEST_BASE_VOLUME_PATH')
    .required()
    .asString();
}
