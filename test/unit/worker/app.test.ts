import { assert } from 'chai';
import { PipelineWorker } from '../../../src/worker';
import { FakeQueue } from '../queue';

describe('worker', () => {
  it('initializes', () => {
    const queue = new FakeQueue();
    const worker = new PipelineWorker(queue);

    assert.isNotNull(worker);
  });
});
