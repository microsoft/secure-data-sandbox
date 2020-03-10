///////////////////////////////////////////////////////////////////////////////
//
// Utilities functions for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import * as chai from 'chai';
import { assert } from 'chai';
import chaiExclude from 'chai-exclude';

import {
  IBenchmark,
  ICandidate,
  ILaboratory,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  RunStatus,
} from '../../../src';

chai.use(chaiExclude);

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
