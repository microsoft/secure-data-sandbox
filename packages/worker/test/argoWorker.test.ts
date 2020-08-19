import * as k8s from '@kubernetes/client-node';
import { assert } from 'chai';
import { Workflow } from '../src/argo';
import { ArgoWorker, createWorkflow } from '../src/argoWorker';
import { InMemoryQueue, PipelineRun } from '@microsoft/sds';

describe('worker', () => {
  it('initializes', () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const worker = new ArgoWorker(queue, kc);

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
      },
    };

    const actual = createWorkflow(run);
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
      },
    };

    const actual = createWorkflow(run);
    assert.deepEqual(actual, expected);
  });

  // TODO: Refine this test stub
  // TODO: activate this test
  xit('handlesVolumes', () => {
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
              target: '/input',
              readonly: true,
            },
          ],
        },
      ],
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
              name: 'volume1',
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
                  name: 'volume1',
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
                  name: 'volume1',
                  mountPath: '/input',
                  readOnly: true,
                },
              ],
            },
          },
        ],
      },
    };

    const actual = createWorkflow(run);
    assert.deepEqual(actual, expected);
  });
});
