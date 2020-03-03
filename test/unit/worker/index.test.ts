import { assert } from 'chai';
import { PipelineWorker } from '../../../src/worker';
import { FakeQueue } from '../queue';
import { PipelineRun } from '../../../src/messages';

describe('worker', () => {
  it('initializes', () => {
    const queue = new FakeQueue<PipelineRun>();
    const worker = new PipelineWorker(queue);

    assert.isNotNull(worker);
  });
});
