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
  IBenchmark,
  ICandidate,
  ILaboratory,
  initializeSequelize,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  RunStatus,
  SequelizeLaboratory,
} from '../../../src';

// TODO: remove these temporary imports after integration.
import { PipelineRun } from '../../../src/laboratory/logic/sequelize_laboratory/messages';
import { InMemoryQueue } from '../../../src/laboratory/logic/sequelize_laboratory/queue';

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
  // console.log('initTestEnvironment');
  sequelize = await initializeSequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  await sequelize.sync();
}

export async function resetTestEnvironment() {
  // console.log('resetTestEnvironment');
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

///////////////////////////////////////////////////////////////////////////////
//
// MockLaboratory
//
///////////////////////////////////////////////////////////////////////////////
export class MockLaboratory implements ILaboratory {
  allBenchmarks(): Promise<IBenchmark[]> {
    throw new Error('Method not implemented.');
  }

  oneBenchmark(name: string): Promise<IBenchmark> {
    throw new Error('Method not implemented.');
  }

  upsertBenchmark(
    benchmark: IBenchmark,
    name?: string | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  allCandidates(): Promise<ICandidate[]> {
    throw new Error('Method not implemented.');
  }

  oneCandidate(name: string): Promise<ICandidate> {
    throw new Error('Method not implemented.');
  }

  upsertCandidate(
    candidate: ICandidate,
    name?: string | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  allSuites(): Promise<ISuite[]> {
    throw new Error('Method not implemented.');
  }

  oneSuite(name: string): Promise<ISuite> {
    throw new Error('Method not implemented.');
  }

  upsertSuite(suite: ISuite, name?: string | undefined): Promise<void> {
    throw new Error('Method not implemented.');
  }

  allRuns(): Promise<IRun[]> {
    throw new Error('Method not implemented.');
  }

  oneRun(name: string): Promise<IRun> {
    throw new Error('Method not implemented.');
  }

  createRunRequest(spec: IRunRequest): Promise<IRun> {
    throw new Error('Method not implemented.');
  }

  updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new Error('Method not implemented.');
  }

  reportRunResults(name: string, results: object): Promise<void> {
    throw new Error('Method not implemented.');
  }

  allRunResults(benchmark: string, mode: string): Promise<IResult[]> {
    throw new Error('Method not implemented.');
  }
}
