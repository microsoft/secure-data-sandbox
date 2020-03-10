import { DefaultAzureCredential } from '@azure/identity';
import { assert } from 'chai';
import { AzureStorageQueue } from '../../../src/queue/azure';
import { QueueMode } from '../../../src/queue';

const QUEUE_ENDPOINT = 'https://mystorage.queue.core.windows.net/myqueue';

describe('queue.azure', () => {
  it('initializes', () => {
    const client = new AzureStorageQueue({
      mode: QueueMode.Azure,
      endpoint: QUEUE_ENDPOINT,
      credential: new DefaultAzureCredential(),
      shouldCreateQueue: false,
    });
    assert.isNotNull(client);
  });
});
