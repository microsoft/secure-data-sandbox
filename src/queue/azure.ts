import { DefaultAzureCredential, TokenCredential } from '@azure/identity';
import { DequeuedMessageItem, QueueClient } from '@azure/storage-queue';
import { Queue, QueueMessage } from '.';

/**
 * Simple client to send/receive messages via Azure Storage Queue
 */
export class AzureStorageQueue implements Queue {
  static queueCreated: boolean;

  private readonly client: QueueClient;

  /**
   * Creates an instance of AzureStorageQueue.
   * @param url A URL string pointing to Azure Storage queue, such as "https://mystorage.queue.core.windows.net/myqueue".
   * @param credential A TokenCredential from the @azure/identity package to authenticate via Azure Active Directory.
   */
  constructor(
    url: string,
    credential: TokenCredential = new DefaultAzureCredential()
  ) {
    this.client = new QueueClient(url, credential);
  }

  async enqueue<T>(message: T): Promise<void> {
    await this.ensureQueue();

    const wireMessage = JSON.stringify(message);
    await this.client.sendMessage(wireMessage);
  }

  async dequeue<T>(count = 1): Promise<Array<QueueMessage<T>>> {
    await this.ensureQueue();

    const response = await this.client.receiveMessages({
      numberOfMessages: count,
    });
    return response.receivedMessageItems.map(m => {
      return {
        value: JSON.parse(m.messageText) as T,
        dequeueCount: m.dequeueCount,
        complete: () => this.completeMessage(m),
      };
    });
  }

  private async completeMessage(m: DequeuedMessageItem): Promise<void> {
    await this.client.deleteMessage(m.messageId, m.popReceipt);
  }

  private async ensureQueue(): Promise<void> {
    if (!AzureStorageQueue.queueCreated) {
      await this.client.create();
    }
  }
}
