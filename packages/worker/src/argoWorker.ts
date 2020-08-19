import * as k8s from '@kubernetes/client-node';
import { IQueue, QueueProcessor, PipelineRun } from '@microsoft/sds';
import { Workflow, Template } from './argo';

// Executes Runs by creating an Argo workflow
export class ArgoWorker {
  private readonly processor: QueueProcessor<PipelineRun>;
  private readonly crd: k8s.CustomObjectsApi;

  constructor(queue: IQueue<PipelineRun>, kc: k8s.KubeConfig) {
    this.processor = new QueueProcessor(queue);
    this.crd = kc.makeApiClient(k8s.CustomObjectsApi);
  }

  start() {
    this.processor.start(run => this.processRun(run));
  }

  stop() {
    this.processor.stop();
  }

  private async processRun(run: PipelineRun) {
    const workflow = createWorkflow(run);
    await this.crd.createNamespacedCustomObject(
      'argoproj.io',
      'v1alpha1',
      'runs',
      'workflows',
      workflow
    );
  }
}

export function createWorkflow(run: PipelineRun): Workflow {
  const steps = run.stages.map(s => [
    {
      name: s.name,
      template: s.name,
    },
  ]);

  const templates = run.stages.map(s => {
    const template: Template = {
      name: s.name,
      container: {
        image: s.image,
      },
    };

    if (s.cmd) {
      template.container!.command = s.cmd;
    }

    if (s.env) {
      template.container!.env = Object.entries(s.env || {})?.map(e => ({
        name: e[0],
        value: e[1],
      }));
    }

    return template;
  });

  return {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      generateName: run.name,
    },
    spec: {
      entrypoint: 'run',
      templates: [
        {
          name: 'run',
          steps: steps,
        },
        ...templates,
      ],
    },
  };
}
