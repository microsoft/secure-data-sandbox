import { IQueue, QueueMessage } from '.';

export class InMemoryQueue<T> implements IQueue<T> {
  // Explicitly allowing 'any' for this test helper object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly data: any[] = [];

  readonly visibilityTimeout: number;
  readonly dequeueCounts = new Map<string, number>();

  constructor(visibilityTimeout = 1000) {
    this.visibilityTimeout = visibilityTimeout;
  }

  async enqueue(message: T): Promise<void> {
    this.data.push(message);
  }

  async dequeue(count: number): Promise<Array<QueueMessage<T>>> {
    const items = new Array<T>();

    for (let i = 0; i < count; i++) {
      if (this.data.length > 0) {
        items.push(this.data.shift());
      }
    }

    for (const item of items) {
      const json = JSON.stringify(item);
      let count = this.dequeueCounts.get(json) ?? 0;
      count++;
      this.dequeueCounts.set(json, count);
    }

    return items.map(m => {
      const itemTimeout = setTimeout(() => {
        this.data.unshift(m);
      }, this.visibilityTimeout);

      const json = JSON.stringify(m);

      return {
        value: m,
        dequeueCount: this.dequeueCounts.get(json)!,
        complete: async () => {
          clearTimeout(itemTimeout);
          this.dequeueCounts.delete(json);
        },
      };
    });
  }
}
