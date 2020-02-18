import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';

import { AnyDescription, Kind, SpecificationBase } from './interfaces';

// Schema generated with typescript-json-schema:
//   typescript-json-schema tsconfig.json AnyDescription --required
const anyDescriptionSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  anyOf: [
    {
      $ref: '#/definitions/BenchmarkDescription',
    },
    {
      $ref: '#/definitions/CandidateDescription',
    },
    {
      $ref: '#/definitions/SuiteDescription',
    },
    {
      $ref: '#/definitions/RunDescription',
    },
  ],
  definitions: {
    BenchmarkDescription: {
      properties: {
        apiVersion: {
          enum: ['0.0.1'],
          type: 'string',
        },
        columns: {
          items: {
            $ref: '#/definitions/ColumnDescription',
          },
          type: 'array',
        },
        description: {
          type: 'string',
        },
        homepage: {
          type: 'string',
        },
        image: {
          type: 'string',
        },
        kind: {
          enum: ['Benchmark'],
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['apiVersion', 'columns', 'image', 'kind', 'name'],
      type: 'object',
    },
    CandidateDescription: {
      properties: {
        apiVersion: {
          enum: ['0.0.1'],
          type: 'string',
        },
        benchmarkId: {
          type: 'string',
        },
        data: {
          additionalProperties: true,
          properties: {},
          type: 'object',
        },
        description: {
          type: 'string',
        },
        image: {
          type: 'string',
        },
        kind: {
          enum: ['Candidate'],
          type: 'string',
        },
        name: {
          type: 'string',
        },
        whitelist: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
      },
      required: ['apiVersion', 'benchmarkId', 'image', 'kind', 'name'],
      type: 'object',
    },
    ColumnDescription: {
      properties: {
        name: {
          type: 'string',
        },
        type: {
          type: 'string',
        },
      },
      required: ['name', 'type'],
      type: 'object',
    },
    RunDescription: {
      properties: {
        apiVersion: {
          enum: ['0.0.1'],
          type: 'string',
        },
        candidateId: {
          type: 'string',
        },
        kind: {
          enum: ['Run'],
          type: 'string',
        },
        suiteId: {
          type: 'string',
        },
      },
      required: ['apiVersion', 'candidateId', 'kind', 'suiteId'],
      type: 'object',
    },
    SuiteDescription: {
      properties: {
        apiVersion: {
          enum: ['0.0.1'],
          type: 'string',
        },
        benchmarkId: {
          type: 'string',
        },
        data: {
          additionalProperties: true,
          properties: {},
          type: 'object',
        },
        description: {
          type: 'string',
        },
        kind: {
          enum: ['Suite'],
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['apiVersion', 'benchmarkId', 'kind', 'name'],
      type: 'object',
    },
  },
};

export class YAMLValidationError extends TypeError {
  constructor(message: string, ajvErrors: betterAjvErrors.IOutputError[]) {
    super(message);
    this.name = 'YAML Validation Error';
  }
}

const ajv = new AJV();
const anyDescriptionValidator = ajv.compile(anyDescriptionSchema);

// tslint:disable-next-line:no-any
export function validateAsAnyDescription(yamlRoot: any): AnyDescription {
  if (!anyDescriptionValidator(yamlRoot)) {
    const message =
      'anyDescriptionValidator: yaml data does not conform to schema.';

    const output = betterAjvErrors(
      anyDescriptionSchema,
      yamlRoot,
      anyDescriptionValidator.errors,
      { format: 'cli', indent: 1 }
    );

    throw new YAMLValidationError(message, output || []);
  }

  return yamlRoot as AnyDescription;
}

export function validateAsKindDescription(
  kind: Kind,
  // tslint:disable-next-line:no-any
  yamlRoot: any
) {
  const description = validateAsAnyDescription(yamlRoot);
  if (description.kind !== kind) {
    const message = `Expected kind=${kind}, found kind=${description.kind}`;
    throw new TypeError(message);
  }
}
