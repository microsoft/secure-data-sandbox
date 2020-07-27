///////////////////////////////////////////////////////////////////////////////
//
// Utilities functions for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import * as chai from 'chai';
import { assert } from 'chai';
import chaiExclude from 'chai-exclude';
import { Sequelize } from 'sequelize-typescript';

import {
  initializeSequelize,
  SequelizeLaboratory,
} from '../../../src';

import { PipelineRun } from '../../../src/messages';
import { InMemoryQueue } from '../../../src/queue';

import { blobBase, serviceURL } from './data';

chai.use(chaiExclude);

///////////////////////////////////////////////////////////////////////////////
//
// Test environment setup
//
///////////////////////////////////////////////////////////////////////////////
export let lab: SequelizeLaboratory;
export let queue: InMemoryQueue<PipelineRun>;
export let sequelize: Sequelize;

export async function initTestEnvironment() {
  sequelize = await initializeSequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  await sequelize.sync();
}

export async function resetTestEnvironment() {
  await sequelize.drop();
  await sequelize.sync();
  queue = new InMemoryQueue<PipelineRun>();
  lab = new SequelizeLaboratory(serviceURL, blobBase, queue);
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

// tslint:disable-next-line:no-any
export function assertDeepEqual(observed: any, expected: any): void {
  assert.deepEqualExcludingEvery(toPOJO(observed), expected, [
    'createdAt',
    'updatedAt',
    'id',
  ]);
}
