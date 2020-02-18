import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

import { AnySpecification, Kind } from '../laboratory';

const maxEncodedNameLength = 64;

// Constants for collection names.
const benchmarkCollection = 'benchmarks';
const candidateCollection = 'candidates';
const runCollection = 'runs';
const suiteCollection = 'suites';

// Table names associated with collections.
const benchmarkTable = 'benchmarks';
const candidateTable = 'candidates';
const runTable = 'runs';
const suiteTable = 'suites';

// Maps collection name to database table name.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names. Currently the results table name is the
// benchmarkID of the run's Benchmark.
//
// ISSUE: should this live in the naming library, or is it really the internal
// workings of the repository service?
const collectionToTable = new Map<string, string>([
  [benchmarkCollection, benchmarkTable],
  [candidateCollection, candidateTable],
  [runCollection, runTable],
  [suiteCollection, suiteTable],
]);

// Maps a Kind to its associated collection name. Collection names can be used
// to determine blob path prefixes and table names.
const kindToCollection = new Map<Kind, string>([
  [Kind.BENCHMARK, benchmarkCollection],
  [Kind.CANDIDATE, candidateCollection],
  [Kind.SUITE, suiteCollection],
  [Kind.RUN, runCollection],
]);

export function specToPath(spec: AnySpecification): string {
  return getPath(spec.kind, specToId(spec));
}

export function specToId(spec: AnySpecification): string {
  switch (spec.kind) {
    case Kind.BENCHMARK:
    case Kind.CANDIDATE:
    case Kind.SUITE:
      return encodeAndVerify(spec.name);
    case Kind.RUN:
      return encodeAndVerify(spec.runId);
    default:
      // We should never get here if spec is truely AnySpecification.
      // Need to use ['kind'] because spec is type `never`.
      const message = `Unsupported kind "${spec['kind']}"`;
      throw new TypeError(message);
  }
}

export function getPath(kind: Kind, name: string) {
  const collection = collectionFromKind(kind);

  switch (kind) {
    case Kind.BENCHMARK:
    case Kind.CANDIDATE:
    case Kind.SUITE:
    case Kind.RUN:
      return `/${collection}/${encodeAndVerify(name)}`;
    default:
      const message = `Unsupported kind "${kind}"`;
      throw new TypeError(message);
  }
}

// TODO: consider using rewire. https://codepunk.io/unit-testing-private-non-exported-functions-in-javascript-with-rewire/
// Exported for unit testing.
export function collectionFromKind(kind: Kind): string {
  const collection = kindToCollection.get(kind);
  if (!collection) {
    const message = `Unknown collection kind "${kind}"`;
    throw new TypeError(message);
  }
  return collection;
}

// TODO: consider using rewire. https://codepunk.io/unit-testing-private-non-exported-functions-in-javascript-with-rewire/
// Exported for unit testing.
export function encodeAndVerify(name: string) {
  // Goals:
  //   Suitable blob and file paths (eliminate most special characters)
  //   Suitable for table names (start with alpha, all lowercase)
  //   Suiteable for bash command parameters (eliminate most special characters)
  //   Eliminate risk of injection attack
  //   Eliminate risk of aliasing attack
  // Alpha-numeric + [.-_]
  // Starts with alpha.
  // Length limited

  // Tables: ^[A-Za-z][A-Za-z0-9]{2,62}$

  const s = name.toLowerCase();
  if (!s.match(/[a-z][a-z0-9]{2,62}$/)) {
    const message = 'Invalid name format.';
    throw new TypeError(message);
  }

  if (s.length > maxEncodedNameLength) {
    const message = `Name too long - limit is ${maxEncodedNameLength}`;
    throw new TypeError(message);
  }

  return s;
}

// Murmurhash seed.
const seed = 1234567;

export function createRunId(): string {
  // Create unique identifier.
  const id = uuid();

  // Hash it to make the value shorter and all numeric.
  // This helps make the id suiteable for table names (just in case).
  // TODO: consider just removing dashes, instead.
  const hashed = v3(id, seed);

  // DESIGN NOTE: prepend 'r' so that name is legal for table names.
  return encodeAndVerify('r' + hashed.toString());
}

// Returns the collection table name associated with a collection name.
// Does not verify that the table exists.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names. Currently the results table name is the
// benchmarkID of the run's Benchmark.
export function getCollectionTable(collection: string): string {
  const table = collectionToTable.get(collection);
  if (table === undefined) {
    const message = `Collection "${collection}" is not associated with a table`;
    throw new TypeError(message);
  }
  return table;
}

// Returns the results table name associated with a benchmarkId.
// Does not verify that the table exists.
// Does not check whether benchmarkId is known to the system.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names.
export function getResultsTable(benchmarkId: string): string {
  // TODO: REVIEW: WARNING: does not check whether benchmarkId is known to
  // the system.

  // Table name based on the hash of the benchmarkId to avoid collisions with
  // built-in tables, form the table name as the

  // Invoke encodeAndVerify() on benchmarkId to normalize case.
  const id = encodeAndVerify(benchmarkId);
  const hash = v3(id, seed).toString();
  const table = 'b' + hash;

  // Invoke encodeAndVerify() again to ensure the final name is legal.
  // This check shouldn't fail.
  return encodeAndVerify(table);
}
