import * as AJV from 'ajv';
import * as betterAjvErrors from 'better-ajv-errors';

import { IEntityBase } from './interfaces';

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

// Goals:
//   Suitable blob and file paths (eliminate most special characters)
//   Suitable for Azure table names (start with alpha, all lowercase)
//   Suiteable for bash command parameters (eliminate most special characters)
//   Eliminate risk of injection attack
//   Eliminate risk of aliasing attack
// Alpha-numeric + [.-_]
// Starts with alpha.
// Length limited
// Azure Tables: ^[A-Za-z][A-Za-z0-9]{2,62}$
export function canonicalName(name: string): string {
  const s = name.toLowerCase();
  if (!s.match(/[a-z][a-z0-9]{2,62}$/)) {
    const message = `Invalid name format "${name}".`;
    throw new TypeError(message);
  }
  return s;
}

export function canonicalize(spec: IEntityBase, name: string): void {
  spec.name = canonicalName(spec.name);
  const name2 = canonicalName(name);
  if (name2 !== spec.name) {
    const message = `${typeof spec} name mismatch - expected "${
      spec.name
    }", found "${name2}"`;
    throw new TypeError(message);
  }
}
