import { assert } from 'chai';
import * as luxon from 'luxon';
import { Column, Model, Sequelize, Table } from 'sequelize-typescript';

import {
  IBenchmark,
  ICandidate,
  IEntityBase,
  IRun,
  ISuite,
  ResultColumn,
  ResultColumnType,
  RunStatus,
} from '../../../../../../src/laboratory/logic/interfaces';

import {
  Benchmark,
  Candidate,
  Run,
  Suite,
} from '../../../../../../src/laboratory/logic/sequelize_laboratory/models';

import { jsonColumn } from '../../../../../../src/laboratory/logic/sequelize_laboratory/models/decorators';

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
  columns: [
    { name: 'pass', type: ResultColumnType.INT },
    { name: 'fail', type: ResultColumnType.INT },
  ],
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
};

const candidate: ICandidate = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
  benchmark: 'benchmark',
  mode: 'mode',
  image: 'image1',
};

const suite: ISuite = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
  benchmark: 'benchmark',
  mode: 'mode',
};

const run: IRun = {
  name: 'foo',
  author: 'bar',
  version: 'v1.0.0',
  createdAt: new Date('1970-01-01T00:00:00.000Z'),
  updatedAt: new Date('1970-01-01T00:00:00.000Z'),
  benchmark,
  candidate,
  suite,
  status: RunStatus.CREATED,
  blob: 'http://blob',
};

let sequelize: Sequelize;

before(async () => {
  sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark, Candidate, Run, Suite]);
  await sequelize.sync();
});

describe('sequelize', () => {
  describe('decorators', () => {
    // it('dateColumn set is nop', async () => {
    //   @Table
    //   class TestDateModel extends Model<TestDateModel> {
    //     @Column(dateColumn('column'))
    //     column!: string;
    //   }

    //   sequelize.addModels([TestDateModel]);
    //   await TestDateModel.sync();

    //   const r = await TestDateModel.create({ column: new Date('2020-02-24T17:26:38.203Z') });
    //   const r2 = (await TestDateModel.findAll())[0];
    //   const old = r2.column;

    //   // Verify that writing to r.column is a nop.
    //   r2.column = '2020-02-24T17:26:38.203Z';
    //   assert.equal(r2.column, '2020-02-24T17:26:38.203Z');
    // });

    it('jsonColumn length overflow', async () => {
      @Table
      class TestModel extends Model<TestModel> {
        @Column(jsonColumn('column', 10))
        column!: string;
      }

      sequelize.addModels([TestModel]);
      await TestModel.sync();

      // Attempt to create a value whose serialization short enough
      TestModel.create({
        column: '0123456',
      });

      // Attempt to create a value whose serialization is too long.
      const f = () =>
        TestModel.create({
          column: '01234567890',
        });
      // TODO: perhaps verify type of error.
      assert.throws(
        f,
        'serialized text too long in json column "column". 14 exceeds limit of 10.'
      );
    });

    //   it('nameColumn normalization', async () => {
    //     @Table
    //     class TestNameModel extends Model<TestNameModel> {
    //       @Column(nameColumn('column'))
    //       column!: string;
    //     }

    //     sequelize.addModels([TestNameModel]);
    //     await TestNameModel.sync();

    //     const r = await TestNameModel.create();

    //     const cases = [
    //       { input: 'lowercase123', expected: 'lowercase123'},
    //       { input: 'UPPERCASE123', expected: 'uppercase123'},
    //       // Length up to 63 ok.
    //       {
    //         input: 'a12345678901234567890123456789012345678901234567890123456789012',
    //         expected: 'a12345678901234567890123456789012345678901234567890123456789012',
    //       },
    //     ];

    //     for (const test of cases) {
    //       console.log(test.input);
    //       r.column = test.input;
    //       assert.equal(r.column, test.expected);
    //     }

    //     const errorCases = [
    //       // Length must be at least 3
    //       '',
    //       'a',
    //       'ab',
    //       // Length cannot exceed 63
    //       'a123456789012345678901234567890123456789012345678901234567890123',
    //       // Improper punctuation
    //       'a.txt',
    //       'a/b',
    //       'a-b',
    //       'a_b',
    //       'a%b',
    //       'a"b',
    //       "a'b",
    //       'a\\b',
    //       'a b',
    //       // Starts with number
    //       '123435',
    //     ];

    //     for (const test of errorCases) {
    //       const f = () => r.column = test;
    //       assert.throws(f);
    //     }
    //   });
    // });

    describe('models', () => {
      // it('benchmark roundtrip', async () => {
      //   const {createdAt, updatedAt, ...rest} = benchmark;
      //   const result = await Benchmark.create(rest);
      //   checkDates(result, benchmark);
      //   checkEqual(result, benchmark);
      //   result.createdAt = '1970-01-01T00:00:00.000Z';
      //   const result2 = await Benchmark.update(
      //     result,
      //     { where: { id: result.id } },
      //   );
      //   console.log('here');
      // });
      // it('benchmark normalization', async () => {
      //   // Tests share same database tables.
      //   // Choose name that hasn't been used by other tests to avoid uniqueness
      //   // constrain violation.
      //   const name = 'benchmarknormalization';
      //   const input: IBenchmark = {
      //     ...benchmark,
      //     name: name.toUpperCase()
      //   }
      //   const expected: IBenchmark = {
      //     ...benchmark,
      //     name
      //   }
      //   const result = await Benchmark.create(input);
      //   checkEqual(result, expected);
      // });
      // it('candidate roundtrip', async () => {
      //   const result = await Candidate.create(candidate);
      //   checkDates(result, candidate);
      //   checkEqual(result, candidate);
      // });
      // it('candidate normalization', async () => {
      //   // Tests share same database tables.
      //   // Choose name that hasn't been used by other tests to avoid uniqueness
      //   // constrain violation.
      //   const name = 'candidatenormalization';
      //   const benchmarkName = 'benchmark';
      //   const mode = 'mode';
      //   const input: ICandidate = {
      //     ...candidate,
      //     name: name.toUpperCase(),
      //     benchmark: benchmarkName.toUpperCase(),
      //     mode: mode.toUpperCase(),
      //   }
      //   const expected: ICandidate = {
      //     ...candidate,
      //     name,
      //     benchmark: benchmarkName,
      //     mode,
      //   }
      //   const result = await Candidate.create(input);
      //   checkEqual(result, expected);
      // });
      // it('run roundtrip', async () => {
      //   const result = await Run.create(run);
      //   checkDates(result, run);
      //   checkEqual(result, run);
      // });
      // it('suite roundtrip', async () => {
      //   const result = await Suite.create(suite);
      //   checkDates(result, suite);
      //   checkEqual(result, suite);
      // });
      // it('suite normalization', async () => {
      //   // Tests share same database tables.
      //   // Choose name that hasn't been used by other tests to avoid uniqueness
      //   // constrain violation.
      //   const name = 'suitenormalization';
      //   const benchmarkName = 'benchmark';
      //   const mode = 'mode';
      //   const input: ISuite = {
      //     ...suite,
      //     name: name.toUpperCase(),
      //     benchmark: benchmarkName.toUpperCase(),
      //     mode: mode.toUpperCase(),
      //   }
      //   const expected: ISuite = {
      //     ...candidate,
      //     name,
      //     benchmark: benchmarkName,
      //     mode,
      //   }
      //   const result = await Suite.create(input);
      //   checkEqual(result, expected);
      // });
    });
  });
});

function checkDates(observed: IEntityBase, expected: IEntityBase) {
  // Ensure the createdAt and updatedAt fields are updated with new values.
  assert.notEqual(observed.createdAt, expected.createdAt);
  assert.notEqual(observed.updatedAt, expected.updatedAt);

  // // Ensure the createdAt and updatedAt fields are valid ISO dates.
  // assert.isTrue(isISODate(observed.createdAt!));
  // assert.isTrue(isISODate(observed.updatedAt!));
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
