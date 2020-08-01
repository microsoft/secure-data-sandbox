import { assert } from 'chai';
import { PipelineWorker } from '../src/pipelineWorker';
import { InMemoryQueue, PipelineRun } from '@microsoft/sds';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const worker = new PipelineWorker(queue);

    assert.isNotNull(worker);
  });
});
