import { assert } from 'chai';
import * as luxon from 'luxon';
import { Model, Sequelize } from 'sequelize-typescript';

import {
  IBenchmark,
  ICandidate,
  IEntityBase,
  IRun,
  ISuite,
  RunStatus,
} from '../../../../src/laboratory';

import {
  Benchmark,
  Candidate,
  Run,
  Suite,
} from '../../../../src/laboratory/models';

const benchmark: IBenchmark = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  pipelines: [
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
  ],
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
};

const candidate: ICandidate = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  benchmark: 'benchmark',
  mode: 'mode',
};

const suite: ISuite = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  benchmark: 'benchmark',
  mode: 'mode',
};

const run: IRun = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  benchmark,
  candidate,
  suite,
  status: RunStatus.CREATED,
};

let sequelize: Sequelize;

before(async () => {
  sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark, Candidate, Run, Suite]);
  await Benchmark.sync();
  await Candidate.sync();
  await Run.sync();
  await Suite.sync();
});

describe('laboratory', () => {
  describe('models', () => {
    it('benchmark roundtrip', async () => {
      const result = await Benchmark.create(benchmark);

      checkDates(result, benchmark);
      checkEqual(result, benchmark);
    });

    it('candidate roundtrip', async () => {
      const result = await Candidate.create(candidate);

      checkDates(result, candidate);
      checkEqual(result, candidate);
    });

    it('run roundtrip', async () => {
      const result = await Run.create(run);

      checkDates(result, run);
      checkEqual(result, run);
    });

    it('suite roundtrip', async () => {
      const result = await Suite.create(suite);

      checkDates(result, suite);
      checkEqual(result, suite);
    });
  });
});

function checkDates(observed: IEntityBase, expected: IEntityBase) {
  // Ensure the createdAt and updatedAt fields are updated with new values.
  assert.notEqual(observed.createdAt, expected.createdAt);
  assert.notEqual(observed.updatedAt, expected.updatedAt);

  // Ensure the createdAt and updatedAt fields are valid ISO dates.
  assert.isTrue(isISODate(observed.createdAt));
  assert.isTrue(isISODate(observed.updatedAt));
}

function isISODate(iso: string): boolean {
  const d = luxon.DateTime.fromISO(iso);
  return d.isValid;
}

function checkEqual<T extends Model>(observed: T, expected: IEntityBase) {
  // Verify that row read from database has same values as row written.
  // Strip off the 'id' field, which is added by the database.
  const o = JSON.parse(JSON.stringify(observed));
  const e = {
    ...expected,
    id: observed.id,
    createdAt: observed.createdAt,
    updatedAt: observed.updatedAt,
  };
  assert.deepEqual(o, e);

  // TODO: figure out whether we could use one of the built in asserts,
  // instead of round-tripping through JSON.parse(JSON.stringify()).
  //   assert.deepNestedInclude(observed, benchmark);
  //   assert.deepOwnInclude(observed, benchmark);
  //   assert.deepOwnInclude(observed, benchmark);
  //   assert.deepInclude(observed, benchmark);
}
