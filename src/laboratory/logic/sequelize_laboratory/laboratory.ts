import {
  EntityNotFoundError,
  IBenchmark,
  ICandidate,
  ILaboratory,
  IllegalOperationError,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  Measures,
  RunStatus,
} from '../interfaces';

import { normalizeBenchmark, processBenchmark } from './benchmark';
import { normalizeCandidate, processCandidate } from './candidate';
import { PipelineRun } from '../../../messages';
import { Benchmark, Candidate, Run, Suite, Result } from './models';
import { normalizeName, normalizeRunName } from './normalize';
import { IQueue } from '../../../queue';

import {
  normalizeRunRequest,
  processRunResults,
  processRunRequest,
  processRunStatus,
} from './run';

import { normalizeSuite, processSuite } from './suite';

export class SequelizeLaboratory implements ILaboratory {
  private readonly server: string;
  private readonly queue: IQueue<PipelineRun>;

  constructor(server: string, queue: IQueue<PipelineRun>) {
    this.queue = queue;
    this.server = server;
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Benchmarks
  //
  /////////////////////////////////////////////////////////////////////////////
  allBenchmarks(): Promise<IBenchmark[]> {
    return Benchmark.findAll();
  }

  async oneBenchmark(rawName: string): Promise<IBenchmark> {
    const name = normalizeName(rawName);
    const b = await Benchmark.findOne({ where: { name } });

    if (b === null) {
      const message = `Benchmark "${name}" not found.`;
      throw new EntityNotFoundError(message);
    }

    return b;
  }

  async upsertBenchmark(b: IBenchmark, rawName?: string): Promise<void> {
    const benchmark = normalizeBenchmark(b);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the benchmark's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== benchmark.name) {
        const message = `Benchmark name mismatch: "${benchmark.name}" != "${name}"`;
        throw new IllegalOperationError(message);
      }
    }

    await processBenchmark(benchmark);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Candidates
  //
  /////////////////////////////////////////////////////////////////////////////
  allCandidates(): Promise<ICandidate[]> {
    return Candidate.findAll();
  }

  async oneCandidate(rawName: string): Promise<ICandidate> {
    const name = normalizeName(rawName);
    const candidate = await Candidate.findOne({ where: { name } });

    if (candidate === null) {
      const message = `Candidate "${name}" not found.`;
      throw new EntityNotFoundError(message);
    }

    return candidate;
  }

  async upsertCandidate(c: ICandidate, rawName?: string): Promise<void> {
    const candidate = normalizeCandidate(c);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the candidate's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== candidate.name) {
        const message = `Candidate name mismatch: "${candidate.name}" != "${name}"`;
        throw new IllegalOperationError(message);
      }
    }

    await processCandidate(candidate);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  /////////////////////////////////////////////////////////////////////////////
  allSuites(): Promise<ISuite[]> {
    return Suite.findAll();
  }

  async oneSuite(rawName: string): Promise<ISuite> {
    const name = normalizeName(rawName);
    const suite = await Suite.findOne({ where: { name } });

    if (suite === null) {
      const message = `Suite "${name}" not found.`;
      throw new EntityNotFoundError(message);
    }

    return suite;
  }

  async upsertSuite(s: ISuite, rawName?: string): Promise<void> {
    const suite = normalizeSuite(s);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the candidate's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== suite.name) {
        const message = `Suite name mismatch: "${suite.name}" != "${name}"`;
        throw new IllegalOperationError(message);
      }
    }

    await processSuite(suite);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs and RunRequests
  //
  /////////////////////////////////////////////////////////////////////////////
  allRuns(): Promise<IRun[]> {
    return Run.findAll();
  }

  async oneRun(rawName: string): Promise<IRun> {
    const name = normalizeRunName(rawName);
    const run = await Run.findOne({ where: { name } });

    if (run === null) {
      const message = `Run "${name}" not found.`;
      throw new EntityNotFoundError(message);
    }

    return run;
  }

  async createRunRequest(r: IRunRequest): Promise<IRun> {
    const runRequest = normalizeRunRequest(r);
    return processRunRequest(this.server, runRequest, this.queue);
  }

  async updateRunStatus(rawName: string, status: RunStatus): Promise<void> {
    const name = normalizeRunName(rawName);
    await processRunStatus(name, status);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Results
  //
  /////////////////////////////////////////////////////////////////////////////
  async reportRunResults(rawName: string, measures: Measures): Promise<void> {
    const name = normalizeRunName(rawName);
    await processRunResults(name, measures);
  }

  async allRunResults(benchmark: string, suite: string): Promise<IResult[]> {
    return Result.findAll({ where: { benchmark, suite } });
  }
}
