import * as Dockerode from 'dockerode';
import { PipelineRun, PipelineStage } from '../messages';
import { Queue, QueueProcessor } from '../queue';

const NANO = 1000 * 1000 * 1000;
const GB = 1024 * 1024 * 1024;

/**
 * A worker that executes Docker-based task pipelines pulled from a queue.
 */
export class PipelineWorker {
  private readonly processor: QueueProcessor<PipelineRun>;
  private readonly docker: Dockerode;

  constructor(queue: Queue) {
    this.processor = new QueueProcessor(queue);
    this.docker = new Dockerode();
  }

  start() {
    this.processor.start(run => this.processRun(run));
  }

  private async processRun(run: PipelineRun) {
    try {
      for (const stage of run.stages) {
        const container = await this.runContainer(stage);

        await container.wait();

        await container.remove();
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async runContainer(
    stage: PipelineStage
  ): Promise<Dockerode.Container> {
    const container = await this.docker.createContainer({
      Image: stage.image,
      Env: Object.entries(stage.env ?? {}).map(([k, v]) => `${k}=${v}`),
      Cmd: stage.cmd,
      NetworkDisabled: true,
      HostConfig: {
        NanoCpus: 1.5 * NANO,
        Memory: 2 * GB,
        Mounts: stage.volumes?.map(v => ({
          Type: 'bind',
          Target: v.target,
          Source: v.source,
          ReadOnly: v.readonly,
        })),
        ReadonlyRootfs: true,
        RestartPolicy: {
          Name: '',
        },
      },
    });
    await container.start();

    return container;
  }
}
