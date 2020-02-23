import * as AJV from 'ajv';
import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ICandidate } from '../interfaces';
import { canonicalize, validate } from '../naming';

import { dateColumn } from './decorators';

@Table
export class Candidate extends Model<Candidate> implements ICandidate {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(dateColumn('createdAt'))
  createdAt!: string;

  @Column(dateColumn('updatedAt'))
  updatedAt!: string;

  @Column(DataType.STRING)
  benchmark!: string;

  @Column(DataType.STRING)
  mode!: string;

  // tslint:disable-next-line:no-any
  static validate(spec: any, name: string): ICandidate {
    // Validate JSON schema.
    const result = validate<ICandidate>(spec, validator, schema);

    // Normalize fields (e.g. name to lower, etc.)
    canonicalize(result, name);

    // TODO: should normalization be done with a decorator? How would this work in the pipelines?
    // TODO: normalize benchmark name.
    // TODO: normalize mode?.

    // Validate business rules, if necessary.
    // TODO: get sequelize from Candidate.sequelize.
    // TODO: check for benchmark
    // TODO: check for mode

    return result;
  }
}

// // TODO: perhaps this should go in a logic directory?
// import { Benchmark } from './benchmark';

// export async function processCandidate(candidate: ICandidate) {
//   // TODO: does this even work? Is name the pk?
//   const benchmark = await Benchmark.findByPk(candidate.benchmark);
//   if (!benchmark) {
//     // Bad benchmark.
//     throw 0;
//   }

//   const pipelines = benchmark.pipelines;
//   const modes = pipelines.map(x => x.mode);
//   if (!modes.includes(candidate.mode)) {
//     // Unsupported mode.
//     throw 0;
//   }

//   await Candidate.upsert<Candidate>(candidate);
// }

// Schema generated with
//   typescript-json-schema tsconfig.json ICandidate --required
const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    author: {
      type: 'string',
    },
    benchmark: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    mode: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
  },
  required: ['author', 'benchmark', 'mode', 'name', 'version'],
  type: 'object',
};

const ajv = new AJV();
const validator = ajv.compile(schema);
