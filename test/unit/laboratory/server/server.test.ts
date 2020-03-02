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

// TODO: Perhaps move this to shims.ts.
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/12044
interface XMLHttpRequest {}

import {
  entityBaseReviver,
  IBenchmark,
  ICandidate,
  ILaboratory,
  IPipeline,
  IRun,
  ISuite,
  IRunRequest,
  ResultColumn,
  ResultColumnType,
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

const columns: ResultColumn[] = [
  { name: 'pass', type: ResultColumnType.INT },
  { name: 'fail', type: ResultColumnType.INT },
];

const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: 'v1.0.0',
  pipelines,
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
  columns,
};

const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: 'v1.0.0',
  benchmark: 'benchmark1',
  mode: 'mode1',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
  image: 'image1',
};

const suite1: ISuite = {
  name: 'suite1',
  author: 'author1',
  version: 'v1.0.0',
  benchmark: 'benchmark1',
  mode: 'mode1',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
};

const run1: IRun = {
  name: 'run1',
  author: 'author1',
  version: 'v1.0.0',
  benchmark: benchmark1,
  candidate: candidate1,
  suite: suite1,
  blob: 'http://blobs/run1',
  status: RunStatus.CREATED,
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

  createRun(spec: IRunRequest): Promise<IRun> {
    throw new Error('Method not implemented.');
  }

  updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new Error('Method not implemented.');
  }

  reportResults(name: string, results: object): Promise<void> {
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

    ///////////////////////////////////////////////////////////////////////////
    //
    // Suites
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('suites', () => {
      it('allSuites()', async () => {
        const lab = new MockLaboratory();

        const expected: ISuite[] = [];

        let called = false;
        lab.allSuites = async (): Promise<ISuite[]> => {
          called = true;
          return expected;
        };

        chai
          .request(await createApp(lab))
          .get(`/suites`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expected);
            assert.isTrue(called);
          });
      });

      it('oneSuite()', async () => {
        const lab = new MockLaboratory();

        const expected = 'suite1';
        let observed: string | undefined;
        lab.oneSuite = async (name: string): Promise<ISuite> => {
          observed = name;
          return suite1;
        };

        chai
          .request(await createApp(lab))
          .get(`/suites/${expected}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assertDeepEqual(res.body, suite1);
            assert.equal(observed, expected);
          });
      });

      it('upsertSuite()', async () => {
        const lab = new MockLaboratory();

        let observed: ISuite;
        lab.upsertSuite = async (
          suite: ISuite,
          name?: string
        ): Promise<void> => {
          observed = suite;
        };

        chai
          .request(await createApp(lab))
          .put(`/suites/${suite1.name}`)
          .send(suite1)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(observed, suite1);
          });
      });
    });

    ///////////////////////////////////////////////////////////////////////////
    //
    // Runs
    //
    ///////////////////////////////////////////////////////////////////////////
    describe('runs', () => {
      it('allRuns()', async () => {
        const lab = new MockLaboratory();

        const expected: IRun[] = [];

        let called = false;
        lab.allRuns = async (): Promise<IRun[]> => {
          called = true;
          return expected;
        };

        chai
          .request(await createApp(lab))
          .get(`/runs`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expected);
            assert.isTrue(called);
          });
      });

      it('oneRun()', async () => {
        const lab = new MockLaboratory();

        const expected = 'run1';
        let observed: string | undefined;
        lab.oneRun = async (name: string): Promise<IRun> => {
          observed = name;
          return run1;
        };

        chai
          .request(await createApp(lab))
          .get(`/runs/${expected}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assertDeepEqual(res.body, run1);
            assert.equal(observed, expected);
          });
      });

      it('createRun()', async () => {
        const lab = new MockLaboratory();

        const runRequest: IRunRequest = {
          candidate: run1.candidate.name,
          suite: run1.suite.name,
        };

        let observed: IRun;
        lab.createRun = async (spec: IRunRequest): Promise<IRun> => {
          observed = run1;
          return observed;
        };

        chai
          .request(await createApp(lab))
          .post(`/runs`)
          .send(runRequest)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(observed, run1);

            // HACK: JSON stringify then parse in order to use reviver for the
            // createdAt and updatedAt fields.
            const body = JSON.parse(
              JSON.stringify(res.body),
              entityBaseReviver
            );

            assert.deepEqual(body, run1);
          });
      });
    });
  });
});
