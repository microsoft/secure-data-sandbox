import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';

import { benchmark1, benchmark2, benchmark3 } from '../data';

import {
  assertDeepEqual,
  initTestEnvironment,
  lab,
  resetTestEnvironment,
} from '../shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('laboratory/benchmarks', () => {
  before(initTestEnvironment);
  beforeEach(resetTestEnvironment);

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
    await lab.upsertBenchmark(benchmark1);
    const results1 = await lab.allBenchmarks();
    assertDeepEqual(results1, [benchmark1]);

    await lab.upsertBenchmark(benchmark2);
    const results2 = await lab.allBenchmarks();
    assertDeepEqual(results2, [benchmark1, benchmark2]);

    const benchmark3 = {
      ...benchmark1,
    };
    await lab.upsertBenchmark(benchmark3);
    const results3 = await lab.allBenchmarks();
    assertDeepEqual(results3, [benchmark3, benchmark2]);
  });

  it('upsertBenchmark() - express route mismatch', async () => {
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
