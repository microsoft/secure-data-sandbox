///////////////////////////////////////////////////////////////////////////////
//
// Unit tests for ILaboratory implementations in
//   sequelize_laboratory
//   (future implementations)
//
///////////////////////////////////////////////////////////////////////////////

import * as chai from 'chai';
import { assert } from 'chai';
const chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';
import { Sequelize } from 'sequelize-typescript';
import { URL } from 'url';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  initializeSequelize,
  IRun,
  ISuite,
  ResultColumn,
  ResultColumnType,
  RunStatus,
  IResult,
} from '../../../../src/laboratory/logic';

import { SequelizeLaboratory } from '../../../../src/laboratory/logic/sequelize_laboratory/laboratory';

// TODO: remove these temporary imports after integration.
import { PipelineRun } from '../../../../src/laboratory/logic/sequelize_laboratory/messages';
import { InMemoryQueue } from '../../../../src/laboratory/logic/sequelize_laboratory/queue';
// import { Run } from '../../../../src/laboratory/logic/sequelize_laboratory/models';

// Strip off most sequelize properties, by round-tripping through JSON.
function toPOJO<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// function toPOJO<T>(x: T): T {
//   const {id, ...rest} = JSON.parse(JSON.stringify(x));
//   return rest as T;
// }

function assertDeepEqual(
  // tslint:disable-next-line:no-any
  observed: any,
  // tslint:disable-next-line:no-any
  expected: any
): void {
  const o = toPOJO(observed);

  assert.deepEqualExcludingEvery(o, expected, ['createdAt', 'updatedAt', 'id']);
}

let sequelize: Sequelize;

before(async () => {
  console.log('before');
  sequelize = await initializeSequelize();
});

beforeEach(async () => {
  console.log('beforeEach');
  await sequelize.drop();
  await sequelize.sync();
});

const serviceURL = 'http://localhost:3000'; // TODO: plumb real url.
const blobBase = 'http://blobs';
const queue = new InMemoryQueue<PipelineRun>();
const lab = new SequelizeLaboratory(serviceURL, blobBase, queue);

// class MockQueue<T> implements IQueue<T> {
//   items: T[] = [];

//   async enqueue(message: T): Promise<void> {
//     this.items.push(message);
//   }

//   async dequeue(count: number): Promise<Array<QueueMessage<T>>> {
//     throw new Error("Method not implemented.");
//   }
// }

const pipelines: IPipeline[] = [
  {
    mode: 'mode1',
    stages: [
      {
        // Candidate
      },
      {
        // Benchmark
        image: 'benchmark-image-mode1',
      },
    ],
  },
];

const columns: ResultColumn[] = [
  { name: 'pass', type: ResultColumnType.INT },
  { name: 'fail', type: ResultColumnType.INT },
];

const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: apiVersion,
  pipelines,
  columns,
};

const benchmark2: IBenchmark = {
  name: 'benchmark2',
  author: 'author2',
  version: apiVersion,
  pipelines,
  columns,
};

const benchmark3: IBenchmark = {
  name: 'benchmark3',
  author: 'author3',
  version: apiVersion,
  pipelines,
  columns,
};

const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate1-image',
};

const candidate2: ICandidate = {
  name: 'candidate2',
  author: 'author2',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate2-image',
};

const candidate3: ICandidate = {
  name: 'candidate3',
  author: 'author3',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate3-image',
};

const suite1: ISuite = {
  name: 'suite1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

const suite2: ISuite = {
  name: 'suite2',
  author: 'author2',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

const suite3: ISuite = {
  name: 'suite3',
  author: 'author3',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

describe('laboratory', () => {
  describe('sequelize_laboratory', () => {
    ///////////////////////////////////////////////////////////////////////////
    //
    // Benchmarks
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('benchmark', () => {
      it('allBenchmarks()', async () => {
        const empty = await lab.allBenchmarks();
        assert.deepEqual(empty, []);

        await lab.upsertBenchmark(benchmark1);
        const results1 = await lab.allBenchmarks();
        assertDeepEqual(results1, [benchmark1]);

        await lab.upsertBenchmark(benchmark2);
        const results2 = await lab.allBenchmarks();
        assertDeepEqual(results2, [benchmark1, benchmark2]);
      });

      it('oneBenchmark()', async () => {
        await lab.upsertBenchmark(benchmark1);
        await lab.upsertBenchmark(benchmark2);

        const result1 = await lab.oneBenchmark('benchmark1');
        assertDeepEqual(result1, benchmark1);

        const result2 = await lab.oneBenchmark('benchmark2');
        assertDeepEqual(result2, benchmark2);

        // Throws for unknown name.
        await assert.isRejected(lab.oneBenchmark('unknown'));
      });

      it('upsertBenchmark()', async () => {
        console.log('benchmark');

        await lab.upsertBenchmark(benchmark1);
        const results1 = await lab.allBenchmarks();
        assertDeepEqual(results1, [benchmark1]);

        await lab.upsertBenchmark(benchmark2);
        const results2 = await lab.allBenchmarks();
        assertDeepEqual(results2, [benchmark1, benchmark2]);

        const benchmark3 = {
          ...benchmark1,
          version: benchmark1.version + 'x',
        };
        await lab.upsertBenchmark(benchmark3);
        const results3 = await lab.allBenchmarks();
        assertDeepEqual(results3, [benchmark3, benchmark2]);
      });

      it('upsertBenchmark() - route mismatch', async () => {
        await assert.isRejected(lab.upsertBenchmark(benchmark1, 'benchmark2'));
      });

      it('upsertBenchmark() - normalization', async () => {
        // Throws for invalid name
        const b1 = {
          ...benchmark3,
          name: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertBenchmark(b1));

        // Lowercases name
        const b2 = {
          ...benchmark3,
          name: benchmark3.name.toUpperCase(),
        };
        await lab.upsertBenchmark(b2);

        const result = await lab.oneBenchmark(benchmark3.name);
        assertDeepEqual(result, benchmark3);
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Candidates
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('candidate', () => {
      it('allCandidates()', async () => {
        // First add benchmark referenced by canidate1 and candidate2.
        await lab.upsertBenchmark(benchmark1);

        const empty = await lab.allCandidates();
        assert.deepEqual(empty, []);

        await lab.upsertCandidate(candidate1);
        const results1 = await lab.allCandidates();
        assertDeepEqual(results1, [candidate1]);

        await lab.upsertCandidate(candidate2);
        const results2 = await lab.allCandidates();
        assertDeepEqual(results2, [candidate1, candidate2]);
      });

      it('oneCandidate()', async () => {
        // First add benchmark referenced by canidate1 and candidate2.
        await lab.upsertBenchmark(benchmark1);
        await lab.upsertCandidate(candidate1);
        await lab.upsertCandidate(candidate2);

        const result1 = await lab.oneCandidate('candidate1');
        assertDeepEqual(result1, candidate1);

        const result2 = await lab.oneCandidate('candidate2');
        assertDeepEqual(result2, candidate2);

        // Throws for unknown name.
        await assert.isRejected(lab.oneCandidate('unknown'));
      });

      it('upsertCandidate()', async () => {
        // First add benchmark referenced by candidate1 and candidate2.
        await lab.upsertBenchmark(benchmark1);

        await lab.upsertCandidate(candidate1);
        const results1 = await lab.allCandidates();
        assertDeepEqual(results1, [candidate1]);

        await lab.upsertCandidate(candidate2);
        const results2 = await lab.allCandidates();
        assertDeepEqual(results2, [candidate1, candidate2]);

        const candidate3 = {
          ...candidate1,
          version: candidate1.version + 'x',
        };
        await lab.upsertCandidate(candidate3);
        const results3 = await lab.allCandidates();
        assertDeepEqual(results3, [candidate3, candidate2]);
      });

      it('upsertCandidate() - route mismatch', async () => {
        // First add benchmark referenced by canidate1 and candidate2.
        await lab.upsertBenchmark(benchmark1);

        await assert.isRejected(lab.upsertCandidate(candidate1, 'candidate2'));
      });

      it('upsertCandidate() - normalization', async () => {
        // First add benchmark referenced by canidate1 and candidate2.
        await lab.upsertBenchmark(benchmark1);

        // Throws for invalid name
        const c1 = {
          ...candidate3,
          name: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertCandidate(c1));

        // Throws for invalid benchmark name
        const c2 = {
          ...candidate3,
          benchmark: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertCandidate(c2));

        // Throws for invalid mode name
        const c3 = {
          ...candidate3,
          mode: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertCandidate(c3));

        // Lowercases name, benchmark, mode
        const c4 = {
          ...candidate3,
          name: candidate3.name.toUpperCase(),
          benchmark: candidate3.benchmark.toUpperCase(),
          mode: candidate3.mode.toUpperCase(),
        };
        await lab.upsertCandidate(c4);

        const result = await lab.oneCandidate(candidate3.name);
        assertDeepEqual(result, candidate3);

        // Throws on non-existant benchmark
        const c5 = {
          ...candidate3,
          name: candidate3.name.toUpperCase(),
          benchmark: 'unknown',
          mode: candidate3.mode.toUpperCase(),
        };
        await assert.isRejected(lab.upsertCandidate(c5));

        // Throws on non-existant mode
        const c6 = {
          ...candidate3,
          name: candidate3.name.toUpperCase(),
          mode: 'unknown',
        };
        await assert.isRejected(lab.upsertCandidate(c6));
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Suites
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('suite', () => {
      it('allSuites()', async () => {
        // First add benchmark referenced by suite1 and suite2.
        await lab.upsertBenchmark(benchmark1);

        const empty = await lab.allSuites();
        assert.deepEqual(empty, []);

        await lab.upsertSuite(suite1);
        const results1 = await lab.allSuites();
        assertDeepEqual(results1, [suite1]);

        await lab.upsertSuite(suite2);
        const results2 = await lab.allSuites();
        assertDeepEqual(results2, [suite1, suite2]);
      });

      it('oneSuite()', async () => {
        // First add benchmark referenced by suite1 and suite2.
        await lab.upsertBenchmark(benchmark1);
        await lab.upsertSuite(suite1);
        await lab.upsertSuite(suite2);

        const result1 = await lab.oneSuite('suite1');
        assertDeepEqual(result1, suite1);

        const result2 = await lab.oneSuite('suite2');
        assertDeepEqual(result2, suite2);

        // Throws for unknown name.
        await assert.isRejected(lab.oneSuite('unknown'));
      });

      it('upsertSuite()', async () => {
        // First add benchmark referenced by suite1 and suite2.
        await lab.upsertBenchmark(benchmark1);

        await lab.upsertSuite(suite1);
        const results1 = await lab.allSuites();
        assertDeepEqual(results1, [suite1]);

        await lab.upsertSuite(suite2);
        const results2 = await lab.allSuites();
        assertDeepEqual(results2, [suite1, suite2]);

        const suite3 = {
          ...suite1,
          version: suite1.version + 'x',
        };
        await lab.upsertSuite(suite3);
        const results3 = await lab.allSuites();
        assertDeepEqual(results3, [suite3, suite2]);
      });

      it('upsertSuite() - route mismatch', async () => {
        // First add benchmark referenced by suite1 and suite2.
        await lab.upsertBenchmark(benchmark1);

        await assert.isRejected(lab.upsertSuite(suite1, 'suite2'));
      });

      it('upsertSuite() - normalization', async () => {
        // First add benchmark referenced by suite1 and suite2.
        await lab.upsertBenchmark(benchmark1);

        // Throws for invalid name
        const c1 = {
          ...suite3,
          name: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertSuite(c1));

        // Throws for invalid benchmark name
        const c2 = {
          ...suite3,
          benchmark: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertSuite(c2));

        // Throws for invalid mode name
        const c3 = {
          ...suite3,
          mode: '123_invalid_name',
        };
        await assert.isRejected(lab.upsertSuite(c3));

        // Lowercases name, benchmark, mode
        const c4 = {
          ...suite3,
          name: suite3.name.toUpperCase(),
          benchmark: suite3.benchmark.toUpperCase(),
          mode: suite3.mode.toUpperCase(),
        };
        await lab.upsertSuite(c4);

        const result = await lab.oneSuite(suite3.name);
        assertDeepEqual(result, suite3);

        // Throws on non-existant benchmark
        const c5 = {
          ...suite3,
          name: suite3.name.toUpperCase(),
          benchmark: 'unknown',
          mode: suite3.mode.toUpperCase(),
        };
        await assert.isRejected(lab.upsertSuite(c5));

        // Throws on non-existant mode
        const c6 = {
          ...suite3,
          name: suite3.name.toUpperCase(),
          mode: 'unknown',
        };
        await assert.isRejected(lab.upsertSuite(c6));
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Runs
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('run', () => {
      // // Test development in progress.
      // // Commented out until finished.
      it('allRuns()', async () => {
        const queue = new InMemoryQueue<PipelineRun>();
        const lab = new SequelizeLaboratory(serviceURL, blobBase, queue);

        // Initially, there should be no runs.
        const empty = await lab.allRuns();
        assert.deepEqual(empty, []);

        // First add benchmark, candidate, and suite
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
        const r1 = toPOJO(
          await lab.createRunRequest({
            candidate: candidate1.name,
            suite: suite1.name,
          })
        );

        // Verify entry in Runs table.
        const expected1: IRun = {
          name: r1.name,
          author: 'unknown',
          version: apiVersion,
          benchmark: b1,
          candidate: c1,
          suite: s1,
          blob: `${blobBase}/${r1.name}`,
          status: RunStatus.CREATED,
        };
        // tslint:disable-next-line:no-any
        // assert.deepEqualExcludingEvery(r1 as any, expected1 as any, ['createdAt', 'id', 'updatedAt']);
        assertDeepEqual(r1, expected1);

        // Verify that allRuns() returns a list containing just this one run.
        const allRuns = await lab.allRuns();
        assert.equal(allRuns.length, 1);
        assertDeepEqual(allRuns[0], expected1);

        // Verify that oneRun() returns this one run.
        const oneRun = await lab.oneRun(r1.name);
        assertDeepEqual(oneRun, expected1);

        // // UpdateRunStatus
        // await lab.updateRunStatus(r1.name, RunStatus.COMPLETED);
        // const updatedRun = await lab.oneRun(r1.name);
        // const updatedExpected1 = {
        //   ...expected1,
        //   status: RunStatus.COMPLETED
        // }
        // assertDeepEqual(updatedRun, updatedExpected1);

        // // TODO: updateResults
        // const measures = { passed: 100, failed: 200 };
        // await lab.reportRunResults(r1.name, measures);
        // const results = await lab.allRunResults(suite1.benchmark, suite1.mode);
        // assert.equal(results.length, 1);
        // // TODO: implement lab.allRunResults()

        // TODO: create a second run
        // TODO: verify that allRuns() returns a list containing both runs

        // assert.deepEqual(r1, expected1);
        // const results1 = toPOJO(await lab.allRuns());
        // assert.deepEqual(results1, [expected1]);
        // await lab.upsertSuite(suite2);
        // const results2 = await lab.allSuites();
        // assertDeepEqual(results2, [suite1, suite2]);

        // Verify queue message.
        const messages = await queue.dequeue(2);
        assert.equal(messages.length, 1);
        await messages[0].complete();

        const expected = {
          blobPrefix: new URL(r1.name, blobBase).toString(),
          name: r1.name,
          resultsEndpoint: new URL(
            `runs/${r1.name}/results`,
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
          statusEndpoint: new URL(`runs/${r1.name}`, serviceURL).toString(),
        };
        assert.deepEqual(messages[0].value, expected);

        // UpdateRunStatus()
        await lab.updateRunStatus(r1.name, RunStatus.COMPLETED);
        const updatedRun = await lab.oneRun(r1.name);
        const updatedExpected1 = {
          ...expected1,
          status: RunStatus.COMPLETED,
        };
        assertDeepEqual(updatedRun, updatedExpected1);
        expected1.status = RunStatus.COMPLETED;

        // UpdateResults()
        const measures = { passed: 100, failed: 200 };
        await lab.reportRunResults(r1.name, measures);
        const results = await lab.allRunResults(suite1.benchmark, suite1.mode);
        assert.equal(results.length, 1);
        const expectedResults: IResult = {
          author: 'unknown',
          benchmark: benchmark1.name,
          candidate: candidate1.name,
          measures,
          mode: suite1.mode,
          name: r1.name,
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

        // TODO: verify that allRuns() returns a list containing both runs
        const bothRuns = await lab.allRuns();
        assert.equal(bothRuns.length, 2);
        assertDeepEqual(bothRuns[0], expected1);
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

      // it('oneRun()', async () => {
      //   // Test development in progress.
      //   // Commented out until finished.
      //   const lab = new SequelizeLaboratory(blobBase);
      //   // First add benchmark referenced by suite1 and suite2.
      //   await lab.upsertBenchmark(benchmark1);
      //   await lab.upsertSuite(suite1);
      //   await lab.upsertSuite(suite2);
      //   const result1 = await lab.oneSuite('suite1');
      //   assertDeepEqual(result1, suite1);
      //   const result2 = await lab.oneSuite('suite2');
      //   assertDeepEqual(result2, suite2);
      //   // Throws for unknown name.
      //   await assert.isRejected(lab.oneSuite('unknown'));
      // });
    });
  });
});
