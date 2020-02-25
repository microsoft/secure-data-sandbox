import {
  IBenchmark,
  ICandidate,
  ILaboratory,
  IRun,
  ISuite,
  RunStatus,
} from '../interfaces';

import { Benchmark, Candidate, Run, Suite } from './models';
import { entityBaseReviver, validateCandidate } from '../schemas';
import { initializeSequelize } from './sequelize';

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
export function normalizeName(name: string): string {
  const s = name.toLowerCase();
  if (!s.match(/^[a-z][a-z0-9]{2,62}$/)) {
    const message = `Invalid name format "${name}".`;
    throw new TypeError(message);
  }
  return s;
}

function normalizeBenchmark(benchmark: IBenchmark): IBenchmark {
  // Normalize mode names in pipeline.
  const modes = new Set<string>();
  const pipelines = benchmark.pipelines.map(p => {
    const mode = normalizeName(p.mode);

    // Modes must be unique within a benchmark.
    // TODO: can this be done in the json-schema?
    if (modes.has(mode)) {
      const message = `Encountered duplicated mode "${mode}"`;
      throw new TypeError(message);
    }
    modes.add(mode);

    return {
      ...p,
      mode,
    };
  });

  return {
    ...benchmark,
    name: normalizeName(benchmark.name),
    pipelines,
  };
}

function normalizeCandidate(candidate: ICandidate): ICandidate {
  return {
    ...candidate,
    name: normalizeName(candidate.name),
    benchmark: normalizeName(candidate.benchmark),
    mode: normalizeName(candidate.mode),
  };
}

function normalizeSuite(suite: ISuite): ISuite {
  return {
    ...suite,
    name: normalizeName(suite.name),
    benchmark: normalizeName(suite.benchmark),
    mode: normalizeName(suite.mode),
  };
}

export class SequelizeLaboratory implements ILaboratory {
  constructor() {
    // initializeSequelize();
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
      throw new TypeError(message);
    }

    return b;
  }

  async upsertBenchmark(
    benchmark: IBenchmark,
    rawName?: string
  ): Promise<void> {
    // Normalize the benchmark.
    const b = normalizeBenchmark(benchmark);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the benchmark's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== b.name) {
        const message = `Benchmark name mismatch: "${benchmark.name}" != "${name}"`;
        throw new TypeError(message);
      }
    }

    await Benchmark.upsert<Benchmark>(b);
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
      throw new TypeError(message);
    }

    return candidate;
  }

  async upsertCandidate(
    candidate: ICandidate,
    rawName?: string
  ): Promise<void> {
    // Normalize the candidate.
    const c = normalizeCandidate(candidate);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the candidate's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== c.name) {
        const message = `Candidate name mismatch: "${c.name}" != "${name}"`;
        throw new TypeError(message);
      }
    }

    // Verify that referenced benchmark exists.
    const benchmark = await Benchmark.findOne({ where: { name: c.benchmark } });
    if (!benchmark) {
      const message = `Candidate references unknown benchmark ${c.benchmark}`;
      throw new TypeError(message);
    }

    // Verify that referenced model is provided by benchmark.
    const modes = benchmark.pipelines.map(p => p.mode);
    if (!modes.includes(c.mode)) {
      const message = `Candidate references unknown mode "${c.mode}"`;
      throw new TypeError(message);
    }

    await Candidate.upsert<Candidate>(c);
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
      throw new TypeError(message);
    }

    return suite;
  }

  async upsertSuite(suite: ISuite, rawName?: string): Promise<void> {
    // Normalize the suite.
    const s = normalizeSuite(suite);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the candidate's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== s.name) {
        const message = `Suite name mismatch: "${s.name}" != "${name}"`;
        throw new TypeError(message);
      }
    }

    // Verify that referenced benchmark exists.
    const benchmark = await Benchmark.findOne({ where: { name: s.benchmark } });
    if (!benchmark) {
      const message = `Suite references unknown benchmark ${s.benchmark}`;
      throw new TypeError(message);
    }

    // Verify that referenced model is provided by benchmark.
    const modes = benchmark.pipelines.map(p => p.mode);
    if (!modes.includes(s.mode)) {
      const message = `Suite references unknown mode "${s.mode}"`;
      throw new TypeError(message);
    }

    await Suite.upsert<Suite>(s);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  /////////////////////////////////////////////////////////////////////////////
  allRuns(): Promise<IRun[]> {
    throw new Error('Method not implemented.');
  }
  oneRun(name: string): Promise<IRun> {
    throw new Error('Method not implemented.');
  }
  createRun(candidate: string, suite: string): Promise<IRun> {
    throw new Error('Method not implemented.');
  }
  updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
