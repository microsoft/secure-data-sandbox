import { assert } from 'chai';
import { Worker } from '../src/worker';
import { InMemoryQueue, PipelineRun } from '@microsoft/sds';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const worker = new Worker(queue);

    assert.isNotNull(worker);
  });
});
