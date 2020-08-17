import { Benchmark, Candidate } from './models';
import { normalizeName } from './normalize';
import { ICandidate, IllegalOperationError } from '../interfaces';

export function normalizeCandidate(candidate: ICandidate): ICandidate {
  return {
    ...candidate,
    name: normalizeName(candidate.name),
    benchmark: normalizeName(candidate.benchmark),
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

  await Candidate.upsert<Candidate>(candidate);
}
