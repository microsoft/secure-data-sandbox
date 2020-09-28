#!/usr/bin/env node
import * as k8s from '@kubernetes/client-node';
import {
  PipelineRun,
  GetQueue,
  InitTelemetry,
  ParseQueueConfiguration,
} from '@microsoft/sds';
import { ArgoWorker } from './argoWorker';
import { defaultClient as telemetryClient } from 'applicationinsights';
import { Events } from './telemetry';
import { ParseArgoWorkerConfiguration } from './configuration';

async function main() {
  InitTelemetry();

  const queueConfig = await ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);
  const workerConfig = ParseArgoWorkerConfiguration();

  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  // todo: capture SIGTERM & graceful shutdown
  const worker = new ArgoWorker(queue, kc, workerConfig);
  worker.start();
  console.log('Worker started');

  telemetryClient.trackEvent({
    name: Events.WorkerStarted,
  });
}

main().catch(e => console.error(e));
