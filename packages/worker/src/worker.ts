import { IQueue, QueueProcessor, PipelineRun } from '@microsoft/sds';

export class Worker {
  private readonly processor: QueueProcessor<PipelineRun>;

  constructor(queue: IQueue<PipelineRun>) {
    this.processor = new QueueProcessor(queue);
  }

  start() {
    this.processor.start(run => this.processRun(run));
  }

  stop() {
    this.processor.stop();
  }

  private async processRun(run: PipelineRun) {
    // TODO: execute a run
    console.log(JSON.stringify(run));
  }
}
