#!/usr/bin/env node
import { configuration, GetQueue, PipelineRun } from '@microsoft/sds';
import { Worker } from './worker';

async function main(argv: string[]) {
  const queueConfig = configuration.ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);

  // todo: capture SIGTERM & graceful shutdown
  const worker = new Worker(queue);
  worker.start();
}

main(process.argv).catch(e => console.error(e));
