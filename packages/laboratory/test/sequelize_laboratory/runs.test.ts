import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';

import {
  ILaboratory,
  InMemoryQueue,
  IResult,
  IRun,
  PipelineRun,
  RunStatus,
} from '@microsoft/sds';

import {
  benchmark1,
  benchmark4,
  candidate1,
  candidate2,
  candidate4,
  serviceURL,
  suite1,
  suite4,
} from '../../../sds/test/laboratory/data';

import { assertDeepEqual, initTestEnvironment } from './shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

//
// Test declarations
//
describe('laboratory/runs', () => {
  let lab: ILaboratory;
  let queue: InMemoryQueue<PipelineRun>;

  beforeEach(async () => {
    queue = new InMemoryQueue<PipelineRun>();
    lab = await initTestEnvironment(queue);
  });

  it('end-to-end scenario', async () => {
    // Initially, there should be no runs.
    const empty = await lab.allRuns();
    assert.deepEqual(empty, []);

    // Add a benchmark, two candidates, and a suite
    await lab.upsertBenchmark(benchmark1);
    await lab.upsertCandidate(candidate1);
    await lab.upsertCandidate(candidate2);
    await lab.upsertSuite(suite1);

    // Submit a run request
    const run1 = await lab.createRunRequest({
      candidate: candidate1.name,
      suite: suite1.name,
    });

    // Verify entry in Runs table.
    const expectedRun1: IRun = {
      name: run1.name,
      author: 'unknown',
      apiVersion: 'v1alpha1',
      benchmark: benchmark1,
      candidate: candidate1,
      suite: suite1,
      status: RunStatus.CREATED,
    };
    assertDeepEqual(run1, expectedRun1);

    // Verify that allRuns() returns a list containing just this one run.
    const allRuns = await lab.allRuns();
    assert.equal(allRuns.length, 1);
    assertDeepEqual(allRuns[0], expectedRun1);

    // Verify that oneRun() returns this one run.
    const oneRun = await lab.oneRun(run1.name);
    assertDeepEqual(oneRun, expectedRun1);

    // Verify that message was enqueued.
    const messages = await queue.dequeue(1);
    assert.equal(messages.length, 1);
    await messages[0].complete();

    const expectedMessage = {
      name: run1.name,
      stages: [
        {
          image: candidate1.image,
          name: 'candidate',
          kind: 'candidate',
          volumes: [
            {
              type: 'AzureBlob',
              target: '/input',
              name: 'training',
              source: 'https://sample.blob.core.windows.net/training',
              readonly: true,
            },
          ],
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          image: (benchmark1.stages[1] as any).image,
          name: 'scoring',
          kind: 'container',
          volumes: [
            {
              type: 'AzureBlob',
              target: '/reference',
              name: 'reference',
              source: 'https://sample.blob.core.windows.net/reference',
              readonly: true,
            },
          ],
        },
      ],
      laboratoryEndpoint: serviceURL,
    };
    assert.deepEqual(messages[0].value, expectedMessage);

    // UpdateRunStatus()
    await lab.updateRunStatus(run1.name, RunStatus.COMPLETED);
    const updatedRun = await lab.oneRun(run1.name);
    const updatedExpected1 = {
      ...expectedRun1,
      status: RunStatus.COMPLETED,
    };
    assertDeepEqual(updatedRun, updatedExpected1);

    // UpdateResults()
    const measures = { passed: 100, failed: 200 };
    await lab.reportRunResults(run1.name, measures);
    const results = await lab.allRunResults(
      run1.benchmark.name,
      run1.suite.name
    );
    assert.equal(results.length, 1);
    const expectedResults: IResult = {
      author: 'unknown',
      apiVersion: 'v1alpha1',
      benchmark: benchmark1.name,
      candidate: candidate1.name,
      measures,
      name: run1.name,
      suite: suite1.name,
    };
    assertDeepEqual(results[0], expectedResults);

    // Submit a second run request
    const r2 = await lab.createRunRequest({
      candidate: candidate2.name,
      suite: suite1.name,
    });

    // Verify that allRuns() returns a list containing both runs
    const bothRuns = await lab.allRuns();
    assert.equal(bothRuns.length, 2);
    assertDeepEqual(bothRuns[0], updatedExpected1);
    const expected2: IRun = {
      name: r2.name,
      author: 'unknown',
      apiVersion: 'v1alpha1',
      benchmark: benchmark1,
      candidate: candidate2,
      suite: suite1,
      status: RunStatus.CREATED,
    };
    assertDeepEqual(bothRuns[1], expected2);
  });

  it('injects properties into the run message', async () => {
    await lab.upsertBenchmark(benchmark4);
    await lab.upsertCandidate(candidate4);
    await lab.upsertSuite(suite4);

    const run = await lab.createRunRequest({
      candidate: candidate4.name,
      suite: suite4.name,
    });

    const messages = await queue.dequeue(1);
    await messages[0].complete();

    const expectedMessage: PipelineRun = {
      name: run.name,
      stages: [
        {
          image: 'benchmark4',
          name: 'prep',
          kind: 'container',
          cmd: [
            '--dataset',
            '00000000-0000-0000-0000-000000000000',
            '--candidate-files',
            '/data',
            '--resources',
            '/resources',
            '--evaluation-files',
            '/evaluation',
          ],
          env: {
            MODE: 'prep',
            DATASET: '00000000-0000-0000-0000-000000000000',
          },
          volumes: [
            {
              name: 'candidateData',
              type: 'ephemeral',
              source: undefined,
              target: '/data',
              readonly: false,
            },
            {
              name: 'resources',
              type: 'ephemeral',
              source: undefined,
              target: '/resources',
              readonly: false,
            },
            {
              name: 'labels',
              type: 'ephemeral',
              source: undefined,
              target: '/evaluation',
              readonly: false,
            },
          ],
        },
        {
          image: 'candidate4-image',
          name: 'candidate',
          kind: 'candidate',
          cmd: [
            '--input',
            '/data/input.json',
            '--resources',
            '/resources',
            '--output',
            '/output',
          ],
          env: {
            LOG_LEVEL: 'debug',
            SDS_RUN: run.name,
          },
          volumes: [
            {
              name: 'candidateData',
              type: 'ephemeral',
              source: undefined,
              target: '/data',
              readonly: true,
            },
            {
              name: 'resources',
              type: 'ephemeral',
              source: undefined,
              target: '/resources',
              readonly: true,
            },
            {
              name: 'candidateOutput',
              type: 'ephemeral',
              source: undefined,
              target: '/output',
              readonly: false,
            },
          ],
        },
        {
          image: 'benchmark4',
          name: 'scoring',
          kind: 'container',
          cmd: [
            '--expected',
            '/expected/expected.json',
            '--actual',
            '/actual/actual.json',
            '--resources',
            '/resources',
            '--laboratory',
            serviceURL,
            '--run',
            run.name,
          ],
          env: {
            MODE: 'evaluation',
          },
          volumes: [
            {
              name: 'candidateOutput',
              type: 'ephemeral',
              source: undefined,
              target: '/actual',
              readonly: true,
            },
            {
              name: 'labels',
              type: 'ephemeral',
              source: undefined,
              target: '/expected',
              readonly: true,
            },
            {
              name: 'resources',
              type: 'ephemeral',
              source: undefined,
              target: '/resources',
              readonly: true,
            },
          ],
        },
      ],
      laboratoryEndpoint: serviceURL,
    };
    assert.deepEqual(messages[0].value, expectedMessage);
  });
});
