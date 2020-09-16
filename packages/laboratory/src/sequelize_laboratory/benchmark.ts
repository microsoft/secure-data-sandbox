import { Benchmark } from './models';
import { normalizeName, IBenchmark } from '@microsoft/sds';

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
