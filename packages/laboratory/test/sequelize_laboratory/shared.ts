///////////////////////////////////////////////////////////////////////////////
//
// Utilities functions for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import * as chai from 'chai';
import { assert } from 'chai';
import chaiExclude from 'chai-exclude';

import {
  initializeSequelize,
  SequelizeLaboratory,
} from '../../src/sequelize_laboratory';
import { PipelineRun, InMemoryQueue, IQueue } from '@microsoft/sds';

import { serviceURL } from '../../../sds/test/laboratory/data';

chai.use(chaiExclude);

///////////////////////////////////////////////////////////////////////////////
//
// Test environment setup
//
///////////////////////////////////////////////////////////////////////////////

export async function initTestEnvironment(
  queue: IQueue<PipelineRun> = new InMemoryQueue<PipelineRun>()
) {
  await initializeSequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  return new SequelizeLaboratory(serviceURL, queue);
}

///////////////////////////////////////////////////////////////////////////////
//
// Utility functions
//
///////////////////////////////////////////////////////////////////////////////
// Strip off most sequelize properties, by round-tripping through JSON.
function toPOJO<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertDeepEqual(observed: any, expected: any): void {
  assert.deepEqualExcludingEvery(toPOJO(observed), expected, [
    'createdAt',
    'updatedAt',
    'id',
  ]);
}
