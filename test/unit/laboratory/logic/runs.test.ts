import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';
import { URL } from 'url';

import { IResult, IRun, RunStatus } from '../../../../src';

import {
  benchmark1,
  candidate1,
  candidate2,
  serviceURL,
  suite1,
} from '../data';

import { assertDeepEqual, initTestEnvironment, lab, queue } from '../shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

//
// Test declarations
//
describe('laboratory/runs', () => {
  before(initTestEnvironment);

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
    const messages = await queue.dequeue(2);
    assert.equal(messages.length, 1);
    await messages[0].complete();

    const expectedMessage = {
      name: run1.name,
      resultsEndpoint: new URL(
        `runs/${run1.name}/results`,
        serviceURL
      ).toString(),
      stages: [
        {
          image: candidate1.image,
          name: 'candidate',
          volumes: [
            {
              type: 'AzureBlob',
              target: '/input',
              source: 'https://sample.blob.core.windows.net/training',
              readonly: true,
            },
          ],
        },
        {
          image: benchmark1.stages[1].image!,
          name: 'scoring',
          volumes: [
            {
              type: 'AzureBlob',
              target: '/reference',
              source: 'https://sample.blob.core.windows.net/reference',
              readonly: true,
            },
          ],
        },
      ],
      statusEndpoint: new URL(`runs/${run1.name}`, serviceURL).toString(),
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
      benchmark: benchmark1,
      candidate: candidate2,
      suite: suite1,
      status: RunStatus.CREATED,
    };
    assertDeepEqual(bothRuns[1], expected2);
  });
});
