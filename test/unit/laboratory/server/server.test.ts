///////////////////////////////////////////////////////////////////////////////
//
// This unit test verifies that JSON payloads are transported correctly
// via HTTP to localhost. It makes no attempt to verify the functionality
// of the ILaboratory hosted by the Express server.
//
// Tests
//   JSON deserialization with reviver.
//   Schema validation.
//   Router paths and name extraction.
//   HTTP return codes.
//
///////////////////////////////////////////////////////////////////////////////
import * as chai from 'chai';
import { assert } from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);

import { createApp } from '../../../../src/laboratory/server';

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/12044
interface XMLHttpRequest {}

import {
  IBenchmark,
  ICandidate,
  ILaboratory,
  IPipeline,
  IRun,
  ISuite,
  RunStatus,
} from '../../../../src/laboratory/logic';
import e = require('express');

// TODO: combine with duplicate from laboratory.test.ts
function toPOJO<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// TODO: combine with duplicate from laboratory.test.ts
function assertDeepEqual(
  // tslint:disable-next-line:no-any
  observed: any,
  // tslint:disable-next-line:no-any
  expected: any
): void {
  const o = toPOJO(observed);

  assert.deepEqualExcludingEvery(o, expected, ['createdAt', 'updatedAt', 'id']);
}

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
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
};

const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: 'v1.0.0',
  benchmark: 'benchmark1',
  mode: 'mode1',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
};

class MockLaboratory implements ILaboratory {
  allBenchmarks(): Promise<IBenchmark[]> {
    throw new Error('Method not implemented.');
  }

  oneBenchmark(name: string): Promise<IBenchmark> {
    throw new Error('Method not implemented.');
  }
  upsertBenchmark(
    benchmark: IBenchmark,
    name?: string | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  allCandidates(): Promise<ICandidate[]> {
    throw new Error('Method not implemented.');
  }
  oneCandidate(name: string): Promise<ICandidate> {
    throw new Error('Method not implemented.');
  }
  upsertCandidate(
    candidate: ICandidate,
    name?: string | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  allSuites(): Promise<ISuite[]> {
    throw new Error('Method not implemented.');
  }
  oneSuite(name: string): Promise<ISuite> {
    throw new Error('Method not implemented.');
  }
  upsertSuite(suite: ISuite, name?: string | undefined): Promise<void> {
    throw new Error('Method not implemented.');
  }
  allRuns(): Promise<IRun[]> {
    throw new Error('Method not implemented.');
  }
  oneRun(name: string): Promise<IRun> {
    throw new Error('Method not implemented.');
  }
  createRun(candidate: string, suite: string): Promise<IRun> {
    throw new Error('Method not implemented.');
  }
  updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

describe('laboratory', () => {
  describe('server', () => {
    ///////////////////////////////////////////////////////////////////////////
    //
    // Benchmarks
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('benchmarks', () => {
      it('allBenchmarks()', async () => {
        const lab = new MockLaboratory();

        const expected: IBenchmark[] = [];

        let called = false;
        lab.allBenchmarks = async (): Promise<IBenchmark[]> => {
          called = true;
          return expected;
        };

        chai
          .request(await createApp(lab))
          .get(`/benchmarks`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expected);
            assert.isTrue(called);
          });
      });

      it('oneBenchmark()', async () => {
        const lab = new MockLaboratory();

        const expected = 'benchmark1';
        let observed: string | undefined;
        lab.oneBenchmark = async (name: string): Promise<IBenchmark> => {
          observed = name;
          return benchmark1;
        };

        chai
          .request(await createApp(lab))
          .get(`/benchmarks/${expected}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assertDeepEqual(res.body, benchmark1);
            assert.equal(observed, expected);
          });
      });

      it('upsertBenchmark()', async () => {
        const lab = new MockLaboratory();

        let observed: IBenchmark;
        lab.upsertBenchmark = async (
          benchmark: IBenchmark,
          name?: string
        ): Promise<void> => {
          observed = benchmark;
        };

        chai
          .request(await createApp(lab))
          .put(`/benchmarks/${benchmark1.name}`)
          .send(benchmark1)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(observed, benchmark1);
          });
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Candidates
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('candidates', () => {
      it('allCandidates()', async () => {
        const lab = new MockLaboratory();

        const expected: ICandidate[] = [];

        let called = false;
        lab.allCandidates = async (): Promise<ICandidate[]> => {
          called = true;
          return expected;
        };

        chai
          .request(await createApp(lab))
          .get(`/candidates`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expected);
            assert.isTrue(called);
          });
      });

      it('oneCandidate()', async () => {
        const lab = new MockLaboratory();

        const expected = 'candidate1';
        let observed: string | undefined;
        lab.oneCandidate = async (name: string): Promise<ICandidate> => {
          observed = name;
          return candidate1;
        };

        chai
          .request(await createApp(lab))
          .get(`/candidates/${expected}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assertDeepEqual(res.body, candidate1);
            assert.equal(observed, expected);
          });
      });

      it('upsertCandidate()', async () => {
        const lab = new MockLaboratory();

        let observed: ICandidate;
        lab.upsertCandidate = async (
          candidate: ICandidate,
          name?: string
        ): Promise<void> => {
          observed = candidate;
        };

        chai
          .request(await createApp(lab))
          .put(`/candidates/${candidate1.name}`)
          .send(candidate1)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(observed, candidate1);
          });
      });
    });
  });
});
