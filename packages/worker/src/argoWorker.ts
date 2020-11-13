import * as k8s from '@kubernetes/client-node';
import {
  IQueue,
  QueueProcessor,
  PipelineRun,
  BenchmarkStageKind,
} from '@microsoft/sds';
import { defaultClient } from 'applicationinsights';
import { Workflow, Template, PersistentVolumeClaim } from './argo';
import { ArgoWorkerConfiguration } from './configuration';

// Executes Runs by creating an Argo workflow
export class ArgoWorker {
  private readonly processor: QueueProcessor<PipelineRun>;
  private readonly crd: k8s.CustomObjectsApi;
  private readonly config: ArgoWorkerConfiguration;

  constructor(
    queue: IQueue<PipelineRun>,
    kc: k8s.KubeConfig,
    config: ArgoWorkerConfiguration
  ) {
    this.processor = new QueueProcessor(queue);
    this.crd = kc.makeApiClient(k8s.CustomObjectsApi);
    this.config = config;
  }

  start() {
    this.processor.start(run => this.processRun(run));
  }

  stop() {
    this.processor.stop();
  }

  private async processRun(run: PipelineRun) {
    console.log(`Processing run: ${run.name}`);

    const workflow = createWorkflow(run, this.config);
    await this.crd.createNamespacedCustomObject(
      'argoproj.io',
      'v1alpha1',
      'runs',
      'workflows',
      workflow
    );
  }
}

export function createWorkflow(
  run: PipelineRun,
  config: ArgoWorkerConfiguration
): Workflow {
  const steps = run.stages.map(s => [
    {
      name: s.name,
      template: s.name,
    },
  ]);

  const templates = run.stages.map(s => {
    const template: Template = {
      name: s.name,
      metadata: {
        labels: {
          aadpodidbinding: getIdentity(s.kind),
        },
      },
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
      template.container!.args = s.cmd;
    }

    if (s.env) {
      template.container!.env = Object.entries(s.env || {})?.map(e => ({
        name: e[0],
        value: e[1],
      }));
    } else {
      template.container!.env = [];
    }

    if (defaultClient.config.instrumentationKey) {
      template.container!.env!.push({
        name: 'APPINSIGHTS_INSTRUMENTATIONKEY',
        value: defaultClient.config.instrumentationKey,
      });
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
      ttlStrategy: {
        secondsAfterSuccess: config.successfulRunGCSeconds,
      },
    },
  };

  if (run.stages.some(s => s.volumes?.length || 0 > 0)) {
    const volumeClaimTemplates: PersistentVolumeClaim[] = [];

    for (const stage of run.stages) {
      for (const volume of stage.volumes || []) {
        if (!volumeClaimTemplates.some(c => c.metadata?.name === volume.name)) {
          const pvc: PersistentVolumeClaim = {
            metadata: {
              name: volume.name,
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          };
          if (config.storageClassName) {
            pvc.spec!.storageClassName = config.storageClassName;
          }
          volumeClaimTemplates.push(pvc);
        }
      }
    }

    workflow.spec.volumeClaimTemplates = volumeClaimTemplates;
  }

  return workflow;
}

function getIdentity(kind: string) {
  switch (kind) {
    case BenchmarkStageKind.CANDIDATE:
      return 'candidate';
    case BenchmarkStageKind.CONTAINER:
      return 'benchmark';
    default:
      return 'none';
  }
}
