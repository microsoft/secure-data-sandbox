import { Benchmark, Suite } from './models';
import { normalizeName, IllegalOperationError, ISuite } from '@microsoft/sds';

export function normalizeSuite(suite: ISuite): ISuite {
  return {
    ...suite,
    name: normalizeName(suite.name),
    benchmark: normalizeName(suite.benchmark),
  };
}

export async function processSuite(suite: ISuite): Promise<void> {
  // Verify that referenced benchmark exists.
  const benchmark = await Benchmark.findOne({
    where: { name: suite.benchmark },
  });
  if (!benchmark) {
    const message = `Suite references unknown benchmark ${suite.benchmark}`;
    throw new IllegalOperationError(message);
  }

  await Suite.upsert<Suite>(suite);
}
