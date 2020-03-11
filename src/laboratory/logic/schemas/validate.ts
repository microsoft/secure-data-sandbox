
import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';
import { isLeft } from 'fp-ts/lib/Either'
import { Decoder } from 'io-ts';

export function validate<A, I>(decoder: Decoder<I, A>, data: I): A {
  const x = decoder.decode(data);
  if (isLeft(x)) {
    const message = `${decoder.name}: data does not conform to schema`;
    throw new TypeError(message);
  } else {
    return x.right;
  }
}

import {
  IBenchmark,
  ICandidate,
  IRunRequest,
  ISuite,
  RunStatus,
  Measures,
} from '../interfaces';

import { benchmarkSchema } from './benchmark';
import { candidateSchema } from './candidate';
import { measuresSchema } from './measures';
import { runRequestSchema } from './run_request';
import { runStatusSchema } from './run_status';
import { suiteSchema } from './suite';

const ajv = new AJV();
const benchmarkValidator = ajv.compile(benchmarkSchema);
const candidateValidator = ajv.compile(candidateSchema);
const measuresValidator = ajv.compile(measuresSchema);
const runRequestValidator = ajv.compile(runRequestSchema);
const runStatusValidator = ajv.compile(runStatusSchema);
const suiteValidator = ajv.compile(suiteSchema);

// tslint:disable-next-line:no-any
export function entityBaseReviver(key: string, value: any) {
  if (key === 'updatedAt' || key === 'createdAt') {
    return new Date(value);
  } else {
    return value;
  }
}

// tslint:disable-next-line:no-any
export function validateBenchmark(spec: any): IBenchmark {
  return validateOld<IBenchmark>(spec, benchmarkValidator, benchmarkSchema);
}

// tslint:disable-next-line:no-any
export function validateCandidate(spec: any): ICandidate {
  return validateOld<ICandidate>(spec, candidateValidator, candidateSchema);
}

// tslint:disable-next-line:no-any
export function validateMeasures(spec: any): Measures {
  return validateOld<Measures>(spec, measuresValidator, measuresSchema);
}

// tslint:disable-next-line:no-any
export function validateRunRequest(spec: any): IRunRequest {
  return validateOld<IRunRequest>(spec, runRequestValidator, runRequestSchema);
}

// tslint:disable-next-line:no-any
export function validateRunStatus(spec: any): RunStatus {
  return validateOld<RunStatus>(spec, runStatusValidator, runStatusSchema);
}

// tslint:disable-next-line:no-any
export function validateSuite(spec: any): ISuite {
  return validateOld<ISuite>(spec, suiteValidator, suiteSchema);
}

function validateOld<T>(
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
