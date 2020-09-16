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

import { createApp } from '../src';

import {
  BenchmarkType,
  IBenchmark,
  ICandidate,
  IReportRunResults,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  IUpdateRunStatus,
  Measures,
  RunStatus,
  validate,
  CandidateType,
  SuiteType,
  RunType,
  ILaboratory,
} from '@microsoft/sds';

import {
  benchmark1,
  candidate1,
  run1,
  suite1,
} from '../../sds/test/laboratory/data';
import { initTestEnvironment } from './sequelize_laboratory/shared';

let lab: ILaboratory;

describe('laboratory/server', () => {
  before(async () => {
    lab = await initTestEnvironment();
  });

  ///////////////////////////////////////////////////////////////////////////
  //
  // Benchmarks
  //
  ///////////////////////////////////////////////////////////////////////////
  describe('benchmarks', () => {
    it('allBenchmarks()', async () => {
      const expected: IBenchmark[] = [];

      let called = false;
      lab.allBenchmarks = async (): Promise<IBenchmark[]> => {
        called = true;
        return expected;
      };

      chai
        .request(await createApp(lab))
        .get('/benchmarks')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expected);
          assert.isTrue(called);
        });
    });

    it('oneBenchmark()', async () => {
      let observedName: string | undefined;
      lab.oneBenchmark = async (name: string): Promise<IBenchmark> => {
        observedName = name;
        return benchmark1;
      };

      chai
        .request(await createApp(lab))
        .get(`/benchmarks/${benchmark1.name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          const observed = validate(BenchmarkType, res.body);
          assert.deepEqual(observed, benchmark1);
          assert.equal(observedName, benchmark1.name);
        });
    });

    it('upsertBenchmark()', async () => {
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
      const expected: ICandidate[] = [];

      let called = false;
      lab.allCandidates = async (): Promise<ICandidate[]> => {
        called = true;
        return expected;
      };

      chai
        .request(await createApp(lab))
        .get('/candidates')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expected);
          assert.isTrue(called);
        });
    });

    it('oneCandidate()', async () => {
      let observedName: string | undefined;
      lab.oneCandidate = async (name: string): Promise<ICandidate> => {
        observedName = name;
        return candidate1;
      };

      chai
        .request(await createApp(lab))
        .get(`/candidates/${candidate1.name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          const observed = validate(CandidateType, res.body);
          assert.deepEqual(observed, candidate1);
          assert.equal(observedName, candidate1.name);
        });
    });

    it('upsertCandidate()', async () => {
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
      const expected: ISuite[] = [];

      let called = false;
      lab.allSuites = async (): Promise<ISuite[]> => {
        called = true;
        return expected;
      };

      chai
        .request(await createApp(lab))
        .get('/suites')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expected);
          assert.isTrue(called);
        });
    });

    it('oneSuite()', async () => {
      let observedName: string | undefined;
      lab.oneSuite = async (name: string): Promise<ISuite> => {
        observedName = name;
        return suite1;
      };

      chai
        .request(await createApp(lab))
        .get(`/suites/${suite1.name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          const observed = validate(SuiteType, res.body);
          assert.deepEqual(observed, suite1);
          assert.equal(observedName, suite1.name);
        });
    });

    it('upsertSuite()', async () => {
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
      const expected: IRun[] = [];

      let called = false;
      lab.allRuns = async (): Promise<IRun[]> => {
        called = true;
        return expected;
      };

      chai
        .request(await createApp(lab))
        .get('/runs')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expected);
          assert.isTrue(called);
        });
    });

    it('oneRun()', async () => {
      let observedName: string | undefined;
      lab.oneRun = async (name: string): Promise<IRun> => {
        observedName = name;
        return run1;
      };

      chai
        .request(await createApp(lab))
        .get(`/runs/${run1.name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          const observed = validate(RunType, res.body);
          assert.deepEqual(observed, run1);
          assert.equal(observedName, run1.name);
        });
    });

    it('createRunRequest()', async () => {
      const runRequest: IRunRequest = {
        candidate: run1.candidate.name,
        suite: run1.suite.name,
      };

      let observedRequest: IRunRequest;
      lab.createRunRequest = async (spec: IRunRequest): Promise<IRun> => {
        observedRequest = spec;
        return run1;
      };

      chai
        .request(await createApp(lab))
        .post('/runs')
        .send(runRequest)
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.deepEqual(observedRequest, runRequest);
          const observed = validate(RunType, res.body);
          assert.deepEqual(observed, run1);
        });
    });

    // This test fails because RunStatus.COMPLETED is serialized and transported as
    // Object {completed: ""}
    it('updateRunStatus()', async () => {
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
          assert.equal(res.status, 204);
          assert.equal(observedRawName, name);
          assert.equal(observedStatus, status);
        });
    });

    it('reportRunResults()', async () => {
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
        .post(`/runs/${name}/results`)
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 204);
          assert.equal(observedName, name);
          assert.deepEqual(observedMeasures, measures);
        });
    });

    it('allRunResults()', async () => {
      const benchmark = 'benchmark1';
      const suite = 'suite1';
      const expected: IResult[] = [];

      let called = false;
      let observedBenchmark: string;
      let observedSuite: string;
      lab.allRunResults = async (
        benchmark: string,
        suite: string
      ): Promise<IResult[]> => {
        called = true;
        observedBenchmark = benchmark;
        observedSuite = suite;

        return expected;
      };

      chai
        .request(await createApp(lab))
        .get(`/runs/results?benchmark=${benchmark}&suite=${suite}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expected);
          assert.isTrue(called);
          assert.equal(observedBenchmark, benchmark);
          assert.equal(observedSuite, suite);
        });
    });
  });
});
