import { Benchmark } from './models';
import { normalizeName } from './normalize';
import { IBenchmark } from '../interfaces';

export function normalizeBenchmark(benchmark: IBenchmark): IBenchmark {
  return {
    ...benchmark,
    name: normalizeName(benchmark.name),
  };
}

export async function processBenchmark(benchmark: IBenchmark) {
  // Upsert Benchmark
  await Benchmark.upsert<Benchmark>(benchmark);
}
