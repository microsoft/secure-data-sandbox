import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient } from '@azure/storage-queue';
import { assert } from 'chai';
import * as env from 'env-var';
import { v1 } from 'uuid';
import { GetQueue, QueueMode } from '../../../src/queue';

describe('functional.queue.azure', () => {
  let client: QueueClient;
  let queueEndpoint: string;

  before(async () => {
    const serviceUrl = env
      .get('TEST_QUEUE_SERVICE_URL')
      .required()
      .asUrlString();
    const credential = new DefaultAzureCredential();

    queueEndpoint = `${serviceUrl}${v1()}`;
    client = new QueueClient(queueEndpoint, credential);
    await client.create();
  });

  it('enqueues', async () => {
    const queue = GetQueue({ mode: QueueMode.Azure, endpoint: queueEndpoint });
    await queue.enqueue('test1');
    await queue.enqueue('test2');

    const response = await client.peekMessages({ numberOfMessages: 32 });
    assert.lengthOf(response.peekedMessageItems, 2);
  });

  it('dequeues', async () => {
    const queue = GetQueue({ mode: QueueMode.Azure, endpoint: queueEndpoint });

    const batch1 = await queue.dequeue<string>(1);
    const msg1 = batch1[0];
    assert.equal(msg1.value, 'test1');
    await msg1.complete();

    const batch2 = await queue.dequeue<string>(1);
    const msg2 = batch2[0];
    assert.equal(msg2.value, 'test2');
    await msg2.complete();

    const response = await client.peekMessages({ numberOfMessages: 32 });
    assert.lengthOf(response.peekedMessageItems, 0);
  });

  after(async () => {
    await client.delete();
  });
});
