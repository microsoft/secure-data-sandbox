import { assert } from 'chai';
import { PipelineWorker } from '../../../src/worker';
import { InMemoryQueue } from '../../../src/queue';
import { PipelineRun } from '../../../src/messages';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const worker = new PipelineWorker(queue);

    assert.isNotNull(worker);
  });
});
