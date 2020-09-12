#!/usr/bin/env node
import * as k8s from '@kubernetes/client-node';
import { configuration, GetQueue, PipelineRun } from '@microsoft/sds';
import { ArgoWorker } from './argoWorker';

async function main() {
  const queueConfig = await configuration.ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);

  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  // todo: capture SIGTERM & graceful shutdown
  const worker = new ArgoWorker(queue, kc);
  worker.start();
  console.log('Worker started');
}

main().catch(e => console.error(e));
