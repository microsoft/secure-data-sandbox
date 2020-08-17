import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import * as nock from 'nock';

import { LaboratoryClient } from '../../../src/laboratory/client';
import { benchmark1, candidate1, run1, suite1, runRequest1 } from '../data';

import {
  BenchmarkType,
  CandidateType,
  IReportRunResults,
  IUpdateRunStatus,
  Measures,
  RunStatus,
  SuiteType,
  validate,
} from '../../../src';

chai.use(chaiAsPromised);

const endpoint = 'http://localhost:3000';

describe('laboratory/client', () => {
  ///////////////////////////////////////////////////////////////////////////
  //
  // Benchmarks
  //
  ///////////////////////////////////////////////////////////////////////////
  describe('benchmarks', () => {
    it('allBenchmarks()', async () => {
      nock(endpoint).get('/benchmarks').reply(200, []);

      const client = new LaboratoryClient(endpoint);
      const benchmarks = await client.allBenchmarks();
      assert.deepEqual(benchmarks, []);
    });

    it('oneBenchmark()', async () => {
      nock(endpoint)
        .get(`/benchmarks/${benchmark1.name}`)
        .reply(200, benchmark1);

      const client = new LaboratoryClient(endpoint);
      const observed = await client.oneBenchmark(benchmark1.name);
      assert.deepEqual(observed, benchmark1);
    });

    it('upsertBenchmark()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .put(`/benchmarks/${benchmark1.name}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await client.upsertBenchmark(benchmark1);
      const observed = validate(BenchmarkType, request!);
      assert.deepEqual(observed, benchmark1);
    });

    it('upsertBenchmark() - name mismatch', async () => {
      const badName = benchmark1.name + '123';
      let request: nock.Body;
      nock(endpoint)
        .put(`/benchmarks/${badName}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await assert.isRejected(client.upsertBenchmark(benchmark1, badName));
    });
  });

  ///////////////////////////////////////////////////////////////////////////
  //
  // Candidates
  //
  ///////////////////////////////////////////////////////////////////////////
  describe('candidates', () => {
    it('allCandidates()', async () => {
      nock(endpoint).get('/candidates').reply(200, []);

      const client = new LaboratoryClient(endpoint);
      const candidates = await client.allCandidates();
      assert.deepEqual(candidates, []);
    });

    it('oneCandidate()', async () => {
      nock(endpoint)
        .get(`/candidates/${candidate1.name}`)
        .reply(200, candidate1);

      const client = new LaboratoryClient(endpoint);
      const observed = await client.oneCandidate(candidate1.name);
      assert.deepEqual(observed, candidate1);
    });

    it('upsertCandidate()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .put(`/candidates/${candidate1.name}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await client.upsertCandidate(candidate1);
      const observed = validate(CandidateType, request!);
      assert.deepEqual(observed, candidate1);
    });

    it('upsertCandidate() - name mismatch', async () => {
      const badName = candidate1.name + '123';
      let request: nock.Body;
      nock(endpoint)
        .put(`/candidates/${badName}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await assert.isRejected(client.upsertCandidate(candidate1, badName));
    });
  });

  ///////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  ///////////////////////////////////////////////////////////////////////////
  describe('suites', () => {
    it('allSuites()', async () => {
      nock(endpoint).get('/suites').reply(200, []);

      const client = new LaboratoryClient(endpoint);
      const suites = await client.allSuites();
      assert.deepEqual(suites, []);
    });

    it('oneSuite())', async () => {
      nock(endpoint).get(`/suites/${suite1.name}`).reply(200, suite1);

      const client = new LaboratoryClient(endpoint);
      const observed = await client.oneSuite(suite1.name);
      assert.deepEqual(observed, suite1);
    });

    it('upsertSuite()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .put(`/suites/${suite1.name}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await client.upsertSuite(suite1);
      const observed = validate(SuiteType, request!);
      assert.deepEqual(observed, suite1);
    });

    it('upsertSuite() - name mismatch', async () => {
      const badName = suite1.name + '123';
      let request: nock.Body;
      nock(endpoint)
        .put(`/suites/${badName}`)
        .reply(200, (uri: string, body: nock.Body) => {
          request = body;
        });

      const client = new LaboratoryClient(endpoint);
      await assert.isRejected(client.upsertSuite(suite1, badName));
    });
  });

  ///////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  ///////////////////////////////////////////////////////////////////////////
  describe('runs', () => {
    it('allRuns()', async () => {
      nock(endpoint).get('/runs').reply(200, []);

      const client = new LaboratoryClient(endpoint);
      const runs = await client.allRuns();
      assert.deepEqual(runs, []);
    });

    it('oneRun())', async () => {
      nock(endpoint).get(`/runs/${run1.name}`).reply(200, run1);

      const client = new LaboratoryClient(endpoint);
      const observed = await client.oneRun(run1.name);
      assert.deepEqual(observed, run1);
    });

    it('createRunRequest()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .post('/runs')
        .reply(202, (uri: string, body: nock.Body) => {
          request = body;
          return run1;
        });

      const client = new LaboratoryClient(endpoint);
      const observed = await client.createRunRequest(runRequest1);
      assert.deepEqual(request!, runRequest1);
      assert.deepEqual(observed, run1);
    });

    it('updateRunStatus()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .patch(`/runs/${run1.name}`)
        .reply(204, (uri: string, body: nock.Body) => {
          request = body;
        });

      const body: IUpdateRunStatus = {
        status: RunStatus.COMPLETED,
      };

      const client = new LaboratoryClient(endpoint);
      await client.updateRunStatus(run1.name, body.status);
      assert.deepEqual(request!, body);
    });

    it('reportRunResults()', async () => {
      let request: nock.Body;
      nock(endpoint)
        .post(`/runs/${run1.name}/results`)
        .reply(204, (uri: string, body: nock.Body) => {
          request = body;
        });

      const measures: Measures = {
        passed: 1,
        failed: 2,
      };
      const body: IReportRunResults = { measures };

      const client = new LaboratoryClient(endpoint);
      await client.reportRunResults(run1.name, measures);
      assert.deepEqual(request!, body);
    });

    it('allRunResults()', async () => {
      const benchmark = 'benchmark1';
      const suite = 'suite1';

      nock(endpoint)
        .get(`/runs?benchmark=${benchmark}&suite=${suite}`)
        .reply(200, []);

      const client = new LaboratoryClient(endpoint);
      const runs = await client.allRunResults(benchmark, suite);
      assert.deepEqual(runs, []);
    });
  });
});
