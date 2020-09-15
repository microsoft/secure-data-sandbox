import * as k8s from '@kubernetes/client-node';
import { IQueue, QueueProcessor, PipelineRun } from '@microsoft/sds';
import { Workflow, Template, PersistentVolumeClaim } from './argo';

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
    console.log(`Processing run: ${run.name}`);

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

    const volumeMounts = s.volumes?.map(v => ({
      name: v.name,
      mountPath: v.target,
      readOnly: v.readonly,
    }));
    if (volumeMounts) {
      template.container!.volumeMounts = volumeMounts;
    }

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

  const workflow: Workflow = {
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

  if (run.stages.some(s => s.volumes?.length || 0 > 0)) {
    const volumeClaimTemplates: PersistentVolumeClaim[] = [];

    for (const stage of run.stages) {
      if (stage.volumes) {
        for (const volume of stage.volumes) {
          if (
            !volumeClaimTemplates.some(c => c.metadata?.name === volume.name)
          ) {
            volumeClaimTemplates.push({
              metadata: {
                name: volume.name,
              },
              spec: {
                // TODO: Set this as a parameter
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '1Gi',
                  },
                },
              },
            });
          }
        }
      }
    }

    workflow.spec.volumeClaimTemplates = volumeClaimTemplates;
  }

  return workflow;
}
