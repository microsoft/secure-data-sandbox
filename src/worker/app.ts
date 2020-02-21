import * as env from 'env-var';
import { Queue, GetQueue, QueueMode } from '../queue';
import { Run } from '../messages';

/**
 * Processes messages from a queue.
 */
export class Worker {
  private readonly queue: Queue;
  private readonly receiveInterval: number;

  constructor(queue: Queue, receiveInterval = 10000) {
    this.queue = queue;
    this.receiveInterval = receiveInterval;
  }

  async start() {
    await this.processBatch();
    setInterval(() => this.processBatch(), this.receiveInterval);
  }

  private async processBatch() {
    for (const message of await this.queue.dequeue<Run>(1)) {
      console.log(message.value);

      //TODO(noel): handle the run here

      await message.complete();
    }
  }
}

async function main() {
  const queueMode = env
    .get('QUEUE_MODE')
    .required()
    .asEnum(Object.values(QueueMode)) as QueueMode;
  const queueUrl = env
    .get('QUEUE_URL')
    .required()
    .asUrlString();

  const queue = GetQueue(queueMode, queueUrl);
  const worker = new Worker(queue);
  worker.start();
}

main().catch(e => console.error(e));
