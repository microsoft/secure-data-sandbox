import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';
import { Sequelize } from 'sequelize-typescript';

import { benchmark1, suite1, suite2, suite3 } from '../data';

import {
  assertDeepEqual,
  initTestEnvironment,
  lab,
  resetTestEnvironment,
} from '../shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('laboratory/suites', () => {
  before(initTestEnvironment);
  beforeEach(resetTestEnvironment);

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
    };
    await lab.upsertSuite(suite3);
    const results3 = await lab.allSuites();
    assertDeepEqual(results3, [suite3, suite2]);
  });

  it('upsertSuite() - express route mismatch', async () => {
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
