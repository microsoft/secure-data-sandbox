// TODO: remove this file after integration.
// This file actually belongs in src/queue.

/**
 * Simple interface to send/receive messages from a queue.
 */
// tslint:disable-next-line:interface-name
export interface IQueue<T> {
  /**
   * Enqueue a single message, serialized as JSON.
   * @param message An object/message to place on the queue.
   */
  enqueue(message: T): Promise<void>;

  /**
   * Dequeue a batch of JSON-formatted messages.
   * You will need to call message.complete() on each message to remove it from the queue.
   */
  dequeue(count: number): Promise<Array<QueueMessage<T>>>;
}

/**
 * Message envelope that supports generic types and processing confirmation.
 */
export interface QueueMessage<T> {
  value: T;
  complete(): Promise<void>;
}

export class InMemoryQueue<T> implements IQueue<T> {
  private readonly queue: T[] = [];
  private readonly processing = new Set<QueueMessage<T>>();

  async enqueue(message: T): Promise<void> {
    this.queue.push(message);
  }

  async dequeue(count: number): Promise<Array<QueueMessage<T>>> {
    const messages: Array<QueueMessage<T>> = [];
    for (let i = 0; i < count; ++i) {
      const value = this.queue.shift();
      if (!value) {
        break;
      }

      const p = this.processing;
      const m: QueueMessage<T> = {
        value,
        complete: async () => {
          p.delete(m);
        },
      };
      messages.push(m);
    }

    // DESIGN NOTE: add messages to this.processing after first for loop to
    // reduce the chance that an exception might strand unreturned messages
    // in the this.processing step. We would still need a catch clause that
    // would put the messages back at the head of the queue.
    for (const m of messages) {
      this.processing.add(m);
    }

    return messages;
  }
}
