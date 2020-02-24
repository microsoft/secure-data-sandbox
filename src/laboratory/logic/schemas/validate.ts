import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';

import { IBenchmark, ICandidate, IEntityBase } from '../interfaces';

import { benchmarkSchema } from './benchmark';
import { candidateSchema } from './candidate';

const ajv = new AJV();
const benchmarkValidator = ajv.compile(benchmarkSchema);
const candidateValidator = ajv.compile(candidateSchema);

// tslint:disable-next-line:no-any
export function validateBenchmark(spec: any): IBenchmark {
  return validate<IBenchmark>(spec, benchmarkValidator, benchmarkSchema);
}

// tslint:disable-next-line:no-any
export function validateCandidate(spec: any): ICandidate {
  return validate<ICandidate>(spec, candidateValidator, candidateSchema);
}

export function validate<T extends IEntityBase>(
  // tslint:disable-next-line:no-any
  spec: any,
  validator: AJV.ValidateFunction,
  schema: object
): T {
  // Validate JSON schema.
  if (!validator(spec)) {
    const message = 'specification does not conform to json schema';
    const output = betterAjvErrors(schema, spec, validator.errors, {
      format: 'cli',
      indent: 1,
    });
    throw new SchemaValidationError(message, output || []);
  }

  return spec;
}

export class SchemaValidationError extends TypeError {
  constructor(message: string, ajvErrors: betterAjvErrors.IOutputError[]) {
    super(message);
    this.name = 'Schema Validation Error';
  }
}
