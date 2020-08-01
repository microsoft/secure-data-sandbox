import * as chai from 'chai';
import { assert } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chaiExclude from 'chai-exclude';
import { Sequelize } from 'sequelize-typescript';

import { initializeSequelize, SequelizeLaboratory } from '../../../src';

import { benchmark1, candidate1, candidate2, candidate3 } from '../data';

import {
  assertDeepEqual,
  initTestEnvironment,
  lab,
  resetTestEnvironment,
} from '../shared';

chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('laboratory/candidates', () => {
  before(initTestEnvironment);
  beforeEach(resetTestEnvironment);

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
    };
    await lab.upsertCandidate(candidate3);
    const results3 = await lab.allCandidates();
    assertDeepEqual(results3, [candidate3, candidate2]);
  });

  it('upsertCandidate() - express route mismatch', async () => {
    // First add benchmark referenced by candidate1 and candidate2.
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

    // Lowercases name, benchmark
    const c4 = {
      ...candidate3,
      name: candidate3.name.toUpperCase(),
      benchmark: candidate3.benchmark.toUpperCase(),
    };
    await lab.upsertCandidate(c4);

    const result = await lab.oneCandidate(candidate3.name);
    assertDeepEqual(result, candidate3);

    // Throws on non-existant benchmark
    const c5 = {
      ...candidate3,
      name: candidate3.name.toUpperCase(),
      benchmark: 'unknown',
    };
    await assert.isRejected(lab.upsertCandidate(c5));
  });
});
