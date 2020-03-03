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

    return { ...p, mode };
  });

  // Normalize result column names
  const columnNames = new Set<string>();
  const columns = benchmark.columns.map(c => {
    const name = normalizeName(c.name);

    // Column names must be unique within a benchmark.
    // TODO: can this be done in the json-schema?
    if (columnNames.has(name)) {
      const message = `Encountered duplicated column "${name}"`;
      throw new TypeError(message);
    }
    columnNames.add(name);

    return { ...c, name };
  });

  return {
    ...benchmark,
    name: normalizeName(benchmark.name),
    pipelines,
    columns,
  };
}

export async function processBenchmark(benchmark: IBenchmark) {
  // Create and sync model for results table.
  // Only do this if it doesn't already exist.

  // Upsert Benchmark
  await Benchmark.upsert<Benchmark>(benchmark);
}
