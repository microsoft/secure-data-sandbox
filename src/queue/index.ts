import { AzureStorageQueue, AzureStorageQueueConfiguration } from './azure';

/**
 * Simple interface to send/receive messages from a queue.
 */
// tslint:disable:interface-name
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
  // tsc ensures that all elements of the discriminated union are covered: https://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking
  // The following is safe but tslint doesn't understand, so we suppress the rule: https://github.com/palantir/tslint/issues/2104
  // tslint:disable:switch-default
  switch (config.mode) {
    case QueueMode.Azure:
      const azureConfig = config as AzureStorageQueueConfiguration;
      return new AzureStorageQueue<T>(azureConfig);
  }
}

// re-exports so 'queue' is usable at the top-level
export * from './azure';
export * from './processor';
