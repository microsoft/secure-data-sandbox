import { TokenCredential } from '@azure/identity';
import { DequeuedMessageItem, QueueClient } from '@azure/storage-queue';
import { IQueue, QueueMessage, QueueConfiguration, QueueMode } from '.';
import { TelemetryClient, defaultClient } from 'applicationinsights';
import { Events } from '../telemetry';

export interface AzureStorageQueueConfiguration extends QueueConfiguration {
  mode: QueueMode.Azure;
  credential: TokenCredential;
  shouldCreateQueue: boolean;
}

/**
 * Simple client to send/receive messages via Azure Storage Queue
 */
export class AzureStorageQueue<T> implements IQueue<T> {
  private queueCreated = false;

  private readonly client: QueueClient;
  private readonly shouldCreateQueue: boolean;
  private readonly telemetryClient: TelemetryClient;

  /**
   * Creates an instance of AzureStorageQueue.
   * @param url A URL string pointing to Azure Storage queue, such as "https://mystorage.queue.core.windows.net/myqueue".
   * @param credential A TokenCredential from the @azure/identity package to authenticate via Azure Active Directory.
   */
  constructor(
    config: AzureStorageQueueConfiguration,
    telemetryClient: TelemetryClient = defaultClient
  ) {
    this.client = new QueueClient(config.endpoint, config.credential);
    this.shouldCreateQueue = config.shouldCreateQueue;
    this.telemetryClient = telemetryClient;
  }

  async enqueue(message: T): Promise<void> {
    await this.ensureQueue();

    const wireMessage = JSON.stringify(message);
    const response = await this.client.sendMessage(wireMessage);

    this.telemetryClient.trackEvent({
      name: Events.QueueMessageCreated,
      properties: {
        storageAccount: this.client.accountName,
        name: this.client.name,
        messageId: response.messageId,
      },
    });
  }

  async dequeue(count = 1): Promise<Array<QueueMessage<T>>> {
    await this.ensureQueue();

    const response = await this.client.receiveMessages({
      numberOfMessages: count,
    });

    return response.receivedMessageItems.map(m => {
      this.telemetryClient.trackEvent({
        name: Events.QueueMessageDequeued,
        properties: {
          storageAccount: this.client.accountName,
          name: this.client.name,
          messageId: m.messageId,
        },
      });

      return {
        value: JSON.parse(m.messageText) as T,
        dequeueCount: m.dequeueCount,
        complete: () => this.completeMessage(m),
      };
    });
  }

  private async completeMessage(m: DequeuedMessageItem): Promise<void> {
    await this.client.deleteMessage(m.messageId, m.popReceipt);

    this.telemetryClient.trackEvent({
      name: Events.QueueMessageCompleted,
      properties: {
        storageAccount: this.client.accountName,
        name: this.client.name,
        messageId: m.messageId,
      },
    });
  }

  private async ensureQueue(): Promise<void> {
    if (this.shouldCreateQueue && !this.queueCreated) {
      await this.client.create();
      this.queueCreated = true;

      this.telemetryClient.trackEvent({
        name: Events.QueueCreated,
        properties: {
          storageAccount: this.client.accountName,
          name: this.client.name,
        },
      });
    }
  }
}
