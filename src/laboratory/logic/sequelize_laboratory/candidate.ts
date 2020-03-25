import { Benchmark, Candidate } from './models';
import { normalizeName } from './normalize';
import { ICandidate, IllegalOperationError } from '../interfaces';

export function normalizeCandidate(candidate: ICandidate): ICandidate {
  return {
    ...candidate,
    name: normalizeName(candidate.name),
    benchmark: normalizeName(candidate.benchmark),
    mode: normalizeName(candidate.mode),
  };
}

export async function processCandidate(candidate: ICandidate): Promise<void> {
  // Verify that referenced benchmark exists.
  const benchmark = await Benchmark.findOne({
    where: { name: candidate.benchmark },
  });
  if (!benchmark) {
    const message = `Candidate references unknown benchmark ${candidate.benchmark}`;
    throw new IllegalOperationError(message);
  }

  // Verify that referenced model is provided by benchmark.
  const modes = benchmark.pipelines.map(p => p.mode);
  if (!modes.includes(candidate.mode)) {
    const message = `Candidate references unknown mode "${candidate.mode}"`;
    throw new IllegalOperationError(message);
  }

  await Candidate.upsert<Candidate>(candidate);
}
