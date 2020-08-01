import { QueueClient } from '@azure/storage-queue';
import { assert } from 'chai';
import { IQueue } from '../../../src/queue';
import { getQueueConfiguration } from '../configuration';

describe('functional.queue.azure', () => {
  interface TestMessage {
    name: string;
    children?: Array<{
      id: number;
      childName: string;
    }>;
  }

  describe('withExistingQueue', () => {
    let client: QueueClient;
    let queue: IQueue<string>;

    before(async () => {
      const config = getQueueConfiguration<string>();
      client = config.client;
      queue = config.queue;

      await client.create();
    });

    after(async () => {
      await client.delete();
    });

    it('enqueues', async () => {
      await queue.enqueue('test1');
      await queue.enqueue('test2');

      const response = await client.peekMessages({ numberOfMessages: 32 });
      assert.lengthOf(response.peekedMessageItems, 2);
    });

    it('dequeues', async () => {
      const batch1 = await queue.dequeue(1);
      const msg1 = batch1[0];
      assert.equal(msg1.value, 'test1');
      await msg1.complete();

      const batch2 = await queue.dequeue(1);
      const msg2 = batch2[0];
      assert.equal(msg2.value, 'test2');
      await msg2.complete();

      const response = await client.peekMessages({ numberOfMessages: 32 });
      assert.lengthOf(response.peekedMessageItems, 0);
    });

    it('handlesObjects', async () => {
      const input: TestMessage = {
        name: 'foo',
      };

      const { queue } = getQueueConfiguration<TestMessage>();
      await queue.enqueue(input);

      const response = await queue.dequeue(1);
      const msg = response[0];
      const output = msg.value;
      await msg.complete();

      assert.deepStrictEqual(output, input);
    });

    it('handlesObjectsWithChildren', async () => {
      const input: TestMessage = {
        name: 'foo',
        children: [
          {
            id: 1,
            childName: 'child1',
          },
          {
            id: 2,
            childName: 'child2',
          },
        ],
      };

      const { queue } = getQueueConfiguration<TestMessage>();
      await queue.enqueue(input);

      const response = await queue.dequeue(1);
      const msg = response[0];
      const output = msg.value;
      await msg.complete();

      assert.deepStrictEqual(output, input);
    });
  });

  describe('withNewQueue', () => {
    let client: QueueClient;
    let queue: IQueue<string>;

    before(async () => {
      const config = getQueueConfiguration<string>();
      client = config.client;
      queue = config.queue;
    });

    after(async () => {
      await client.delete();
    });

    it('enqueues', async () => {
      await queue.enqueue('test1');
      await queue.enqueue('test2');

      const response = await client.peekMessages({ numberOfMessages: 32 });
      assert.lengthOf(response.peekedMessageItems, 2);
    });
  });
});
