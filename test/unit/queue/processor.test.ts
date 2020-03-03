import { assert } from 'chai';
import * as FakeTimers from '@sinonjs/fake-timers';
import { FakeQueue } from '../queue';
import { QueueProcessor } from '../../../src/queue';

describe('processor', () => {
  let clock: FakeTimers.InstalledClock;

  before(() => {
    clock = FakeTimers.install();
  });

  after(() => {
    clock.uninstall();
  });

  it('initializesWithDefaults', () => {
    const queue = new FakeQueue<string>();
    const processor = new QueueProcessor(queue);

    assert.isNotNull(processor);
  });

  it('starts', async () => {
    const queue = new FakeQueue<string>();
    const processor = new QueueProcessor(queue);

    await Promise.all([
      queue.enqueue('msg 1'),
      queue.enqueue('msg 2'),
      queue.enqueue('msg 3'),
    ]);

    processor.start(async msg => {
      // no-op
    });

    assert.equal(queue.data.length, 3);
    await clock.tickAsync(15000);
    assert.equal(queue.data.length, 0);

    processor.stop();
  });

  it('stops', async () => {
    const queue = new FakeQueue<string>();
    const processor = new QueueProcessor(queue, {
      receiveBatchSize: 1,
      receiveIntervalMs: 5000,
    });

    await Promise.all([
      queue.enqueue('msg 1'),
      queue.enqueue('msg 2'),
      queue.enqueue('msg 3'),
    ]);

    processor.start(async msg => {
      // no-op
    });

    assert.equal(queue.data.length, 3);
    await clock.tickAsync(5000);
    assert.equal(queue.data.length, 1);

    processor.stop();
    await clock.tickAsync(60000);
    assert.equal(queue.data.length, 1);
  });

  it('usesMaxAttemptsPerMessage', async () => {
    const queue = new FakeQueue<string>(1000);
    const processor = new QueueProcessor(queue, {
      maxAttemptsPerMessage: 3,
      receiveBatchSize: 1,
      receiveIntervalMs: 5000,
    });

    await queue.enqueue('msg 1');

    let attempts = 0;
    processor.start(async msg => {
      attempts++;
      throw new Error('simulated failure');
    });

    assert.equal(queue.data.length, 1);
    await clock.tickAsync(15000);
    assert.equal(attempts, 3);
    assert.equal(queue.data.length, 0);

    processor.stop();
  });

  it('usesReceiveBatchSize', async () => {
    const queue = new FakeQueue<string>();
    const processor = new QueueProcessor(queue, {
      receiveBatchSize: 5,
      receiveIntervalMs: 5000,
    });

    await Promise.all([
      queue.enqueue('msg 1'),
      queue.enqueue('msg 2'),
      queue.enqueue('msg 3'),
      queue.enqueue('msg 4'),
      queue.enqueue('msg 5'),
    ]);

    let messageCount = 0;
    processor.start(async msg => {
      messageCount++;
    });

    assert.equal(queue.data.length, 5);
    await clock.tickAsync(5000);
    assert.equal(queue.data.length, 0);
    assert.equal(messageCount, 5);

    processor.stop();
  });

  it('usesReceiveIntervalMs', async () => {
    const queue = new FakeQueue<string>();
    const processor = new QueueProcessor(queue, {
      receiveIntervalMs: 10000,
    });

    await Promise.all([
      queue.enqueue('msg 1'),
      queue.enqueue('msg 2'),
      queue.enqueue('msg 3'),
    ]);

    processor.start(async msg => {
      // no-op
    });

    assert.equal(queue.data.length, 3);

    await clock.tickAsync(1);
    assert.equal(queue.data.length, 2);

    await clock.tickAsync(10000);
    assert.equal(queue.data.length, 1);

    await clock.tickAsync(10000);
    assert.equal(queue.data.length, 0);

    processor.stop();
  });
});
