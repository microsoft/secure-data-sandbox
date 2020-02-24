import {
  IBenchmark,
  ICandidate,
  ILaboratory,
  IRun,
  ISuite,
  RunStatus
} from '../interfaces';

import { Benchmark, Candidate, Run, Suite } from './models';

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
  return {
    ...benchmark,
    name: normalizeName(benchmark.name),
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

export class SequelizeLaboratory implements ILaboratory {
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

  async upsertBenchmark(benchmark: IBenchmark, rawName?: string): Promise<void> {
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
    const c = await Candidate.findOne({ where: { name } });

    if (c === null) {
      const message = `Candidate "${name}" not found.`;
      throw new TypeError(message);
    }

    return c;
  }

  async upsertCandidate(candidate: ICandidate, rawName?: string): Promise<void> {
    // Normalize the candidate.
    const c = normalizeCandidate(candidate);

    // If optional rawName parameter is supplied, verify that its normalized
    // form is the same as the candidate's normalized name.
    if (rawName !== undefined) {
      const name = normalizeName(rawName);
      if (name !== c.name) {
        const message = `Candidate name mismatch: "${candidate.name}" != "${name}"`;
        throw new TypeError(message);
      }
    }

    await Candidate.upsert<Candidate>(c);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  /////////////////////////////////////////////////////////////////////////////
  allSuites(): Promise<ISuite[]> {
    throw new Error("Method not implemented.");
  }
  oneSuite(name: string): Promise<ISuite> {
    throw new Error("Method not implemented.");
  }
  upsertSuite(suite: ISuite, name?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  /////////////////////////////////////////////////////////////////////////////
  allRuns(): Promise<IRun[]> {
    throw new Error("Method not implemented.");
  }
  oneRun(name: string): Promise<IRun> {
    throw new Error("Method not implemented.");
  }
  createRun(candidate: string, suite: string): Promise<IRun> {
    throw new Error("Method not implemented.");
  }
  updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
