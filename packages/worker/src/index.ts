import { configuration, GetQueue, PipelineRun } from '@microsoft/sds';
import { PipelineWorker } from './pipelineWorker';

async function main(argv: string[]) {
  const queueConfig = configuration.ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);

  // todo: capture SIGTERM & graceful shutdown
  const worker = new PipelineWorker(queue);
  worker.start();
}

main(process.argv).catch(e => console.error(e));
