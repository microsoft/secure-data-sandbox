import * as k8s from '@kubernetes/client-node';
import { assert } from 'chai';
import { ArgoWorker } from '../src/argoWorker';
import { InMemoryQueue, PipelineRun } from '@microsoft/sds';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const worker = new ArgoWorker(queue, kc);

    assert.isNotNull(worker);
  });
});
