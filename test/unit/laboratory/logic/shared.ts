///////////////////////////////////////////////////////////////////////////////
//
// Utilities functions for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import * as chai from 'chai';
import { assert } from 'chai';
import chaiExclude from 'chai-exclude';

chai.use(chaiExclude);

// Strip off most sequelize properties, by round-tripping through JSON.
export function toPOJO<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// tslint:disable-next-line:no-any
export function assertDeepEqual(observed: any, expected: any): void {
  assert.deepEqualExcludingEvery(toPOJO(observed), expected, [
    'createdAt',
    'updatedAt',
    'id',
  ]);
}
