import { AzureStorageQueue } from './azure';

/**
 * Simple interface to send/receive messages from a queue.
 */
export interface Queue {
  /**
   * Enqueue a single message, serialized as JSON.
   * @param message An object/message to place on the queue.
   */
  enqueue<T>(message: T): Promise<void>;

  /**
   * Dequeue a batch of JSON-formatted messages.
   * You will need to call message.complete() on each message to remove it from the queue.
   */
  dequeue<T>(count: number): Promise<Array<QueueMessage<T>>>;
}

/**
 * Message envelope that supports generic types and processing confirmation.
 */
export interface QueueMessage<T> {
  value: T;
  complete(): Promise<void>;
}

/**
 * Represents a specific Queue implementation.
 */
export enum QueueMode {
  Azure = 'azure',
}

/**
 * Factory to get a Queue.
 * @param mode The implementation to use.
 * @param url The location of the queue.
 */
export function GetQueue(mode: QueueMode, url: string): Queue {
  switch (mode) {
    case QueueMode.Azure:
      return new AzureStorageQueue(url);
    default:
      throw new Error(`Unknown QueueMode: ${mode}`);
  }
}
