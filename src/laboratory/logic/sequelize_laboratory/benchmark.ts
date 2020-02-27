import { Benchmark } from './models';
import { normalizeName } from './normalize';
import { IBenchmark } from '../interfaces';

export function normalizeBenchmark(benchmark: IBenchmark): IBenchmark {
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

export async function processBenchmark(benchmark: IBenchmark) {
  await Benchmark.upsert<Benchmark>(benchmark);
}
