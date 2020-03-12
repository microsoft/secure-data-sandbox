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
  IReportRunResults,
  IRun,
  IRunRequest,
  ISuite,
  IUpdateRunStatus,
  Measures,
  RunStatus,
} from '../../../../src';

import { benchmark1, candidate1, run1, suite1 } from '../data';
import { assertDeepEqual, MockLaboratory } from '../shared';

describe('laboratory/server', () => {
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
      lab.upsertSuite = async (suite: ISuite, name?: string): Promise<void> => {
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

    it('createRunRequest()', async () => {
      const lab = new MockLaboratory();

      const runRequest: IRunRequest = {
        candidate: run1.candidate.name,
        suite: run1.suite.name,
      };

      let observed: IRun;
      lab.createRunRequest = async (spec: IRunRequest): Promise<IRun> => {
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
          assertDeepEqual(res.body, run1);
        });
    });

    // This test fails because RunStatus.COMPLETED is serialized and transported as
    // Object {completed: ""}
    it('updateRunStatus()', async () => {
      const lab = new MockLaboratory();

      const name = 'foobar';
      const status = RunStatus.COMPLETED;
      const body: IUpdateRunStatus = { status };

      let observedRawName: string;
      let observedStatus: RunStatus;
      lab.updateRunStatus = async (
        rawName: string,
        status: RunStatus
      ): Promise<void> => {
        observedRawName = rawName;
        observedStatus = status;
      };

      chai
        .request(await createApp(lab))
        .patch(`/runs/${name}`)
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(observedRawName, name);
          assert.equal(observedStatus, status);
        });
    });

    it('reportRunResults()', async () => {
      const lab = new MockLaboratory();

      const name = 'foobar';
      const measures = { passed: 1, failed: 2 };
      const body: IReportRunResults = { measures };

      let observedName: string;
      let observedMeasures: Measures;
      lab.reportRunResults = async (
        name: string,
        measures: Measures
      ): Promise<void> => {
        observedName = name;
        observedMeasures = measures;
      };

      chai
        .request(await createApp(lab))
        .patch(`/runs/${name}/results`)
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(observedName, name);
          assert.deepEqual(observedMeasures, measures);
        });
    });
  });
});
