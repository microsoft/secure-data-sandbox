import { DefaultAzureCredential } from '@azure/identity';
import { assert } from 'chai';
import { AzureStorageQueue } from '../../../src/queue/azure';

const QUEUE_ENDPOINT = 'https://mystorage.queue.core.windows.net/myqueue';

describe('queue.azure', () => {
  it('initializes', () => {
    const client = new AzureStorageQueue(
      QUEUE_ENDPOINT,
      new DefaultAzureCredential()
    );
    assert.isNotNull(client);
  });
});
