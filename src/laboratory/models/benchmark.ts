import * as AJV from 'ajv';
import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IBenchmark, IPipeline } from '../interfaces';
import { canonicalize, validate } from '../naming';

import { dateColumn, jsonColumn } from './decorators';

@Table
export class Benchmark extends Model<Benchmark> implements IBenchmark {
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
  image!: string;

  @Column(jsonColumn<IPipeline[]>('pipelines', 1024))
  pipelines!: IPipeline[];

  // tslint:disable-next-line:no-any
  static validate(spec: any, name: string): IBenchmark {
    // Validate JSON schema.
    const result = validate<IBenchmark>(spec, validator, schema);

    // Normalize fields (e.g. name to lower, etc.)
    canonicalize(result, name);

    // Validate business rules, if necessary.
    // No business rules for benchmark.

    return result;
  }
}

// Schema generated with
//   typescript-json-schema tsconfig.json IBenchmark --required
const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    ICandidateStage: {
      type: 'object',
    },
    IContainerStage: {
      properties: {
        image: {
          type: 'string',
        },
      },
      required: ['image'],
      type: 'object',
    },
    IPipeline: {
      properties: {
        mode: {
          type: 'string',
        },
        stages: {
          items: {
            anyOf: [
              {
                $ref: '#/definitions/ICandidateStage',
              },
              {
                $ref: '#/definitions/IContainerStage',
              },
            ],
          },
          type: 'array',
        },
      },
      required: ['mode', 'stages'],
      type: 'object',
    },
  },
  properties: {
    author: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    pipelines: {
      items: {
        $ref: '#/definitions/IPipeline',
      },
      type: 'array',
    },
    updatedAt: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
  },
  required: ['author', 'name', 'pipelines', 'version'],
  type: 'object',
};

const ajv = new AJV();
const validator = ajv.compile(schema);
