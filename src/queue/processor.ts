import { IQueue } from '.';

export interface QueueProcessorOptions {
  receiveBatchSize: number;
  receiveIntervalMs: number;
  maxAttemptsPerMessage: number;
}

const defaultQueueProcessorOptions: QueueProcessorOptions = {
  receiveBatchSize: 1,
  receiveIntervalMs: 5000,
  maxAttemptsPerMessage: 3,
};

/**
 * Process messages from a queue with a pluggable message handler.
 */
export class QueueProcessor<T> {
  private readonly queue: IQueue;
  private readonly options: Readonly<QueueProcessorOptions>;
  private interval?: NodeJS.Timeout;

  constructor(queue: IQueue, options?: Partial<QueueProcessorOptions>) {
    this.queue = queue;
    this.options = { ...defaultQueueProcessorOptions, ...options };
  }

  /**
   * Start processing messages from the queue.
   * @param processor A function that processes a single message.
   */
  async start(processor: MessageProcessor<T>) {
    await this.processBatch(processor);
    this.interval = setInterval(
      () => this.processBatch(processor),
      this.options.receiveIntervalMs
    );
  }

  /**
   * Stop receiving new messages. Messages already received will be processed.
   */
  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private async processBatch(processMessage: MessageProcessor<T>) {
    for (const message of await this.queue.dequeue<T>(
      this.options.receiveBatchSize
    )) {
      if (message.dequeueCount > this.options.maxAttemptsPerMessage) {
        //TODO: dead letter
        await message.complete();
      }

      await processMessage(message.value);
      await message.complete();
    }
  }
}

type MessageProcessor<T> = (message: T) => Promise<void>;
