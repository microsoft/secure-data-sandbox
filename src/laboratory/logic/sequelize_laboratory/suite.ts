import { Benchmark, Suite } from './models';
import { normalizeName } from './normalize';
import { ISuite } from '../interfaces';

export function normalizeSuite(suite: ISuite): ISuite {
  return {
    ...suite,
    name: normalizeName(suite.name),
    benchmark: normalizeName(suite.benchmark),
    mode: normalizeName(suite.mode),
  };
}

export async function processSuite(suite: ISuite): Promise<void> {
  // Verify that referenced benchmark exists.
  const benchmark = await Benchmark.findOne({
    where: { name: suite.benchmark },
  });
  if (!benchmark) {
    const message = `Suite references unknown benchmark ${suite.benchmark}`;
    throw new TypeError(message);
  }

  // Verify that referenced model is provided by benchmark.
  const modes = benchmark.pipelines.map(p => p.mode);
  if (!modes.includes(suite.mode)) {
    const message = `Suite references unknown mode "${suite.mode}"`;
    throw new TypeError(message);
  }

  await Suite.upsert<Suite>(suite);
}
