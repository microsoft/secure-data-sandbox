import * as k8s from '@kubernetes/client-node';
import { assert } from 'chai';
import { Workflow } from '../src/argo';
import { ArgoWorker, createWorkflow } from '../src/argoWorker';
import { InMemoryQueue, PipelineRun } from '@microsoft/sds';
import { ArgoWorkerConfiguration } from '../src/configuration';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const config: ArgoWorkerConfiguration = {
      successfulRunGCSeconds: 300,
    };

    const worker = new ArgoWorker(queue, kc, config);

    assert.isNotNull(worker);
  });
});

describe('createWorkflow', () => {
  it('works', () => {
    const run: PipelineRun = {
      name: 'run1',
      statusEndpoint: 'http://localhost:3000/status',
      resultsEndpoint: 'http://localhost:3000/results',
      stages: [
        {
          name: 'candidate',
          image: 'candidate',
        },
        {
          name: 'eval',
          image: 'eval',
        },
      ],
    };

    const config: ArgoWorkerConfiguration = {
      successfulRunGCSeconds: 300,
    };

    const expected: Workflow = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Workflow',
      metadata: {
        generateName: 'run1',
      },
      spec: {
        entrypoint: 'run',
        templates: [
          {
            name: 'run',
            steps: [
              [
                {
                  name: 'candidate',
                  template: 'candidate',
                },
              ],
              [
                {
                  name: 'eval',
                  template: 'eval',
                },
              ],
            ],
          },
          {
            name: 'candidate',
            container: {
              image: 'candidate',
            },
          },
          {
            name: 'eval',
            container: {
              image: 'eval',
            },
          },
        ],
        ttlStrategy: {
          secondsAfterSuccess: 300,
        },
      },
    };

    const actual = createWorkflow(run, config);
    assert.deepEqual(actual, expected);
  });

  it('handlesOptions', () => {
    const run: PipelineRun = {
      name: 'run1',
      statusEndpoint: 'http://localhost:3000/status',
      resultsEndpoint: 'http://localhost:3000/results',
      stages: [
        {
          name: 'candidate',
          image: 'candidate',
          cmd: ['echo', 'I am a candidate'],
          env: {
            SOME_CONFIG: 'active',
          },
        },
        {
          name: 'eval',
          image: 'eval',
          cmd: ['echo', 'I am an evaluator'],
          env: {
            MODE: 'evaluation',
          },
        },
      ],
    };

    const config: ArgoWorkerConfiguration = {
      successfulRunGCSeconds: 300,
    };

    const expected: Workflow = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Workflow',
      metadata: {
        generateName: 'run1',
      },
      spec: {
        entrypoint: 'run',
        templates: [
          {
            name: 'run',
            steps: [
              [
                {
                  name: 'candidate',
                  template: 'candidate',
                },
              ],
              [
                {
                  name: 'eval',
                  template: 'eval',
                },
              ],
            ],
          },
          {
            name: 'candidate',
            container: {
              image: 'candidate',
              command: ['echo', 'I am a candidate'],
              env: [
                {
                  name: 'SOME_CONFIG',
                  value: 'active',
                },
              ],
            },
          },
          {
            name: 'eval',
            container: {
              image: 'eval',
              command: ['echo', 'I am an evaluator'],
              env: [
                {
                  name: 'MODE',
                  value: 'evaluation',
                },
              ],
            },
          },
        ],
        ttlStrategy: {
          secondsAfterSuccess: 300,
        },
      },
    };

    const actual = createWorkflow(run, config);
    assert.deepEqual(actual, expected);
  });

  it('handlesVolumes', () => {
    const run: PipelineRun = {
      name: 'run1',
      statusEndpoint: 'http://localhost:3000/status',
      resultsEndpoint: 'http://localhost:3000/results',
      stages: [
        {
          name: 'candidate',
          image: 'candidate',
          volumes: [
            {
              source: undefined,
              type: 'ephemeral',
              name: 'images',
              target: '/input',
              readonly: true,
            },
            {
              source: undefined,
              type: 'ephemeral',
              name: 'predictions',
              target: '/output',
              readonly: false,
            },
          ],
        },
        {
          name: 'eval',
          image: 'eval',
          volumes: [
            {
              source: undefined,
              type: 'ephemeral',
              name: 'predictions',
              target: '/input',
              readonly: true,
            },
            {
              source: undefined,
              type: 'ephemeral',
              name: 'scores',
              target: '/output',
              readonly: false,
            },
          ],
        },
      ],
    };

    const config: ArgoWorkerConfiguration = {
      successfulRunGCSeconds: 300,
    };

    const expected: Workflow = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Workflow',
      metadata: {
        generateName: 'run1',
      },
      spec: {
        entrypoint: 'run',
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'images',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          },
          {
            metadata: {
              name: 'predictions',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          },
          {
            metadata: {
              name: 'scores',
            },
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          },
        ],
        templates: [
          {
            name: 'run',
            steps: [
              [
                {
                  name: 'candidate',
                  template: 'candidate',
                },
              ],
              [
                {
                  name: 'eval',
                  template: 'eval',
                },
              ],
            ],
          },
          {
            name: 'candidate',
            container: {
              image: 'candidate',
              volumeMounts: [
                {
                  name: 'images',
                  mountPath: '/input',
                  readOnly: true,
                },
                {
                  name: 'predictions',
                  mountPath: '/output',
                  readOnly: false,
                },
              ],
            },
          },
          {
            name: 'eval',
            container: {
              image: 'eval',
              volumeMounts: [
                {
                  name: 'predictions',
                  mountPath: '/input',
                  readOnly: true,
                },
                {
                  name: 'scores',
                  mountPath: '/output',
                  readOnly: false,
                },
              ],
            },
          },
        ],
        ttlStrategy: {
          secondsAfterSuccess: 300,
        },
      },
    };

    const actual = createWorkflow(run, config);
    assert.deepEqual(actual, expected);
  });

  it('handlesVolumesWithStorageClass', () => {
    const run: PipelineRun = {
      name: 'run1',
      statusEndpoint: 'http://localhost:3000/status',
      resultsEndpoint: 'http://localhost:3000/results',
      stages: [
        {
          name: 'candidate',
          image: 'candidate',
          volumes: [
            {
              source: undefined,
              type: 'ephemeral',
              name: 'images',
              target: '/input',
              readonly: true,
            },
          ],
        },
      ],
    };

    const config: ArgoWorkerConfiguration = {
      successfulRunGCSeconds: 300,
      storageClassName: 'runs-transient',
    };

    const expected: Workflow = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Workflow',
      metadata: {
        generateName: 'run1',
      },
      spec: {
        entrypoint: 'run',
        volumeClaimTemplates: [
          {
            metadata: {
              name: 'images',
            },
            spec: {
              storageClassName: 'runs-transient',
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '1Gi',
                },
              },
            },
          },
        ],
        templates: [
          {
            name: 'run',
            steps: [
              [
                {
                  name: 'candidate',
                  template: 'candidate',
                },
              ],
            ],
          },
          {
            name: 'candidate',
            container: {
              image: 'candidate',
              volumeMounts: [
                {
                  name: 'images',
                  mountPath: '/input',
                  readOnly: true,
                },
              ],
            },
          },
        ],
        ttlStrategy: {
          secondsAfterSuccess: 300,
        },
      },
    };

    const actual = createWorkflow(run, config);
    assert.deepEqual(actual, expected);
  });
});
