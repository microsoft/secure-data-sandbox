import { Benchmark, Candidate } from '../models';
import { ICandidate } from '../interfaces';
import { canonicalName } from '../naming';

export async function processCandidate(spec: ICandidate, name: string) {
  // Name fields are normalized during Candidate.build().
  const candidate = Candidate.build(spec);

  // TODO: normalize name fields or use decorator.
  // TODO: check name fields
  if (canonicalName(name) !== candidate.name) {
    // Name mismatch.
    throw 0;
  }

  // TODO: does this even work? Is name the pk?
  const benchmark = await Benchmark.findByPk(candidate.benchmark);
  if (!benchmark) {
    // Bad benchmark.
    throw 0;
  }

  const pipelines = benchmark.pipelines;
  const modes = pipelines.map(x => x.mode);
  if (!modes.includes(candidate.mode)) {
    // Unsupported mode.
    throw 0;
  }

  await Candidate.upsert<Candidate>(candidate);
}
