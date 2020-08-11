import { AzureStorageQueue, AzureStorageQueueConfiguration } from './azure';
import { InMemoryQueue } from './inmemory';

/**
 * Simple interface to send/receive messages from a queue.
 */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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
  dequeueCount: number;
  complete(): Promise<void>;
}

/**
 * Represents a specific Queue implementation.
 */
export enum QueueMode {
  Azure = 'azure',
  InMemory = 'inmemory',
}

export interface QueueConfiguration {
  mode: QueueMode;
  endpoint: string;
}

/**
 * Factory to get a Queue.
 * @param mode The implementation to use.
 * @param endpoint The location of the queue.
 */
export function GetQueue<T>(config: QueueConfiguration): IQueue<T> {
  switch (config.mode) {
    case QueueMode.InMemory:
      return new InMemoryQueue<T>();
    case QueueMode.Azure:
      return new AzureStorageQueue<T>(config as AzureStorageQueueConfiguration);
  }
}

// re-exports so 'queue' is usable at the top-level
export * from './azure';
export * from './inmemory';
export * from './processor';
