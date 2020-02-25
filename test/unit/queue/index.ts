import { IQueue, QueueMessage } from '../../../src/queue';

export class FakeQueue implements IQueue {
  // Explicitly allowing 'any' for this test helper object
  // tslint:disable:no-any
  private queue: any[];

  constructor() {
    this.queue = [];
  }

  async enqueue<T>(message: T): Promise<void> {
    this.queue.push(message);
  }

  async dequeue<T>(count: number): Promise<Array<QueueMessage<T>>> {
    const items = new Array<T>();
    for (let i = 0; i < count; i++) {
      if (items.length > 0) {
        items.push(this.queue.shift());
      }
    }
    return items.map(m => {
      return {
        value: m,
        dequeueCount: 1,
        complete: () => Promise.resolve(),
      };
    });
  }
}
