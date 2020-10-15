import { assert } from 'chai';

import {
  Benchmark,
  Candidate,
  Run,
  Suite,
} from '../../../src/sequelize_laboratory/models';

import {
  benchmark1,
  candidate1,
  suite1,
  run1,
} from '../../../../sds/test/laboratory/data';

import { assertDeepEqual } from '../shared';
import { initializeSequelize } from '../../../src/sequelize_laboratory';

describe('sequelize', () => {
  before(async () => {
    await initializeSequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
  });

  // TODO: jsonColumn roundtrip

  describe('models', () => {
    it('benchmark roundtrip', async () => {
      // Create a benchmark and read it back.
      await Benchmark.create(benchmark1);
      const result = (await Benchmark.findOne({
        where: { name: benchmark1.name },
      }))!;
      assert.isDefined(result.createdAt);
      assert.isDefined(result.updatedAt);
      assertDeepEqual(result, benchmark1);

      // Update the benchmark and verify the updatedDate field changes.
      await Benchmark.update(result, { where: { name: benchmark1.name } });
      const result2 = (await Benchmark.findOne({
        where: { name: benchmark1.name },
      }))!;
      assert.notEqual(result2.createdAt, result.createdAt);
      assert.notEqual(result2.updatedAt, result.updatedAt);
    });

    it('candidate roundtrip', async () => {
      // Create a candidate and read it back.
      await Candidate.create(candidate1);
      const result = (await Candidate.findOne({
        where: { name: candidate1.name },
      }))!;
      assert.isDefined(result.createdAt);
      assert.isDefined(result.updatedAt);
      assertDeepEqual(result, candidate1);

      // Update the candidate and verify the updatedDate field changes.
      await Candidate.update(result, { where: { name: candidate1.name } });
      const result2 = (await Candidate.findOne({
        where: { name: candidate1.name },
      }))!;
      assert.notEqual(result2.createdAt, result.createdAt);
      assert.notEqual(result2.updatedAt, result.updatedAt);
    });

    it('suite roundtrip', async () => {
      // Create a suite and read it back.
      await Suite.create(suite1);
      const result = (await Suite.findOne({ where: { name: suite1.name } }))!;
      assert.isDefined(result.createdAt);
      assert.isDefined(result.updatedAt);
      assertDeepEqual(result, suite1);

      // Update the suite and verify the updatedDate field changes.
      await Suite.update(result, { where: { name: suite1.name } });
      const result2 = (await Suite.findOne({ where: { name: suite1.name } }))!;
      assert.notEqual(result2.createdAt, result.createdAt);
      assert.notEqual(result2.updatedAt, result.updatedAt);
    });

    it('run roundtrip', async () => {
      // Create a run and read it back.
      await Run.create(run1);
      const result = (await Run.findOne({ where: { name: run1.name } }))!;
      assert.isDefined(result.createdAt);
      assert.isDefined(result.updatedAt);
      assertDeepEqual(result, run1);

      // Update the run and verify the updatedDate field changes.
      await Run.update(result, { where: { name: run1.name } });
      const result2 = (await Run.findOne({ where: { name: run1.name } }))!;
      assert.notEqual(result2.createdAt, result.createdAt);
      assert.notEqual(result2.updatedAt, result.updatedAt);
    });
  });
});
