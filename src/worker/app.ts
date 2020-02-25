import { GetQueue } from '../queue';
import { ParseQueueConfiguration } from '../configuration';
import { PipelineWorker } from '.';

async function main() {
  const queueConfig = ParseQueueConfiguration();
  const queue = GetQueue(queueConfig);

  const worker = new PipelineWorker(queue);
  worker.start();
}

main().catch(e => console.error(e));
