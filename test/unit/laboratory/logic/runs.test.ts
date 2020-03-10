import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';
import { URL } from 'url';

import {
  apiVersion,
  IResult,
  IRun,
  RunStatus,
  SequelizeLaboratory,
} from '../../../../src';

// TODO: remove these temporary imports after integration.
import { PipelineRun } from '../../../../src/laboratory/logic/sequelize_laboratory/messages';
import { InMemoryQueue } from '../../../../src/laboratory/logic/sequelize_laboratory/queue';

import {
  benchmark1,
  blobBase,
  candidate1,
  candidate2,
  pipelines,
  serviceURL,
  suite1,
} from './data';

import { assertDeepEqual, toPOJO } from './shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

//
// Test declarations
//
describe('laboratory/runs', () => {
  it('end-to-end scenario', async () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const lab = new SequelizeLaboratory(serviceURL, blobBase, queue);

    // Initially, there should be no runs.
    const empty = await lab.allRuns();
    assert.deepEqual(empty, []);

    // Add a benchmark, two candidates, and a suite
    await lab.upsertBenchmark(benchmark1);
    await lab.upsertCandidate(candidate1);
    await lab.upsertCandidate(candidate2);
    await lab.upsertSuite(suite1);

    // Get the actual benchmark, candidate, and suite records back with
    // sequelize ids, createdAt, and updatedAt fields.
    const b1 = toPOJO(await lab.oneBenchmark(benchmark1.name));
    const c1 = toPOJO(await lab.oneCandidate(candidate1.name));
    const c2 = toPOJO(await lab.oneCandidate(candidate2.name));
    const s1 = toPOJO(await lab.oneSuite(suite1.name));

    // Submit a run request
    const run1 = toPOJO(
      await lab.createRunRequest({
        candidate: candidate1.name,
        suite: suite1.name,
      })
    );

    // Verify entry in Runs table.
    const expectedRun1: IRun = {
      name: run1.name,
      author: 'unknown',
      version: apiVersion,
      benchmark: b1,
      candidate: c1,
      suite: s1,
      blob: `${blobBase}/${run1.name}`,
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
      blobPrefix: new URL(run1.name, blobBase).toString(),
      name: run1.name,
      resultsEndpoint: new URL(
        `runs/${run1.name}/results`,
        serviceURL
      ).toString(),
      stages: [
        {
          image: candidate1.image,
          name: 'candidate',
        },
        {
          image: pipelines[0].stages[1].image!,
          name: 'benchmark',
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
    const results = await lab.allRunResults(suite1.benchmark, suite1.mode);
    assert.equal(results.length, 1);
    const expectedResults: IResult = {
      author: 'unknown',
      benchmark: benchmark1.name,
      candidate: candidate1.name,
      measures,
      mode: suite1.mode,
      name: run1.name,
      suite: suite1.name,
      version: apiVersion,
    };
    assertDeepEqual(results[0], expectedResults);

    // Submit a second run request
    const r2 = toPOJO(
      await lab.createRunRequest({
        candidate: candidate2.name,
        suite: suite1.name,
      })
    );

    // Verify that allRuns() returns a list containing both runs
    const bothRuns = await lab.allRuns();
    assert.equal(bothRuns.length, 2);
    assertDeepEqual(bothRuns[0], updatedExpected1);
    const expected2: IRun = {
      name: r2.name,
      author: 'unknown',
      version: apiVersion,
      benchmark: b1,
      candidate: c2,
      suite: s1,
      blob: `${blobBase}/${r2.name}`,
      status: RunStatus.CREATED,
    };
    assertDeepEqual(bothRuns[1], expected2);
  });
});
