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

chai.use(chaiExclude);
chai.use(chaiAsPromised);

import {
  Benchmark,
  Candidate,
  Run,
  Suite,
} from '../../../../src/laboratory/logic/sequelize_laboratory/models';

import {
  IBenchmark,
  ICandidate,
  IPipeline,
} from '../../../../src/laboratory/logic';

import { SequelizeLaboratory } from '../../../../src/laboratory/logic/sequelize_laboratory/laboratory';

let sequelize: Sequelize;

function toPOJO<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function assertDeepEqual(
  // tslint:disable-next-line:no-any
  observed: any,
  // tslint:disable-next-line:no-any
  expected: any
): void {
  const o = toPOJO(observed);

  assert.deepEqualExcludingEvery(o, expected, ['createdAt', 'updatedAt', 'id']);
}

before(async () => {
  console.log('before');
  sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark, Candidate, Run, Suite]);
  await sequelize.sync();
});

beforeEach(async () => {
  console.log('before each');
  await sequelize.drop();
  await sequelize.sync();
});

const pipelines: IPipeline[] = [
  {
    mode: 'mode1',
    stages: [
      {
        image: 'stage1 image',
      },
      {
        image: 'stage2 image',
      },
    ],
  },
];

const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: 'v1.0.0',
  pipelines,
};

const benchmark2: IBenchmark = {
  name: 'benchmark2',
  author: 'author2',
  version: 'v1.0.0',
  pipelines,
};

const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: 'v1.0.0',
  benchmark: 'benchmark1',
  mode: 'mode1',
};

const candidate2: ICandidate = {
  name: 'candidate2',
  author: 'author2',
  version: 'v1.0.0',
  benchmark: 'benchmark2',
  mode: 'mode2',
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
        const lab = new SequelizeLaboratory();

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
        const lab = new SequelizeLaboratory();

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

        const lab = new SequelizeLaboratory();

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
        const lab = new SequelizeLaboratory();
        await assert.isRejected(lab.upsertBenchmark(benchmark1, 'benchmark2'));
      });

      it('upsertBenchmark() - normalization', async () => {
        // Normalize name
        // Invalid name
        assert.isTrue(false);
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Candidates
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('candidate', () => {
      it('allCandidates()', async () => {
        const lab = new SequelizeLaboratory();

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
        const lab = new SequelizeLaboratory();

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
        console.log('candidate');

        const lab = new SequelizeLaboratory();

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
        const lab = new SequelizeLaboratory();
        await assert.isRejected(lab.upsertCandidate(candidate1, 'candidate2'));
      });

      it('upsertCandidate() - normalization', async () => {
        // Normalize name, benchmark, candidate
        // Invalid name, benchmark, candidate
        assert.isTrue(false);
      });
    });
  });
});
