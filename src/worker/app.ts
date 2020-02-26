import { GetQueue } from '../queue';
import { ParseQueueConfiguration } from '../configuration';
import { PipelineWorker } from '.';
import { PipelineRun } from '../messages';

async function main() {
  const queueConfig = ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);

  // todo: capture SIGTERM & graceful shutdown
  const worker = new PipelineWorker(queue);
  worker.start();
}

main().catch(e => console.error(e));
