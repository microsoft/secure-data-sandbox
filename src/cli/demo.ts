import * as yaml from 'js-yaml';

import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  ISuite,
  LaboratoryClient,
  RunStatus,
} from '../laboratory';

const pipelines: IPipeline[] = [
  {
    mode: 'mode1',
    stages: [
      {
        // Candidate
      },
      {
        // Benchmark
        image: 'benchmark-image-mode1',
      },
    ],
  },
];

const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: apiVersion,
  pipelines,
};

const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate1-image',
};

const suite1: ISuite = {
  name: 'suite1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

export async function configureDemo(lab: LaboratoryClient) {
  await lab.upsertBenchmark(benchmark1);
  await lab.upsertCandidate(candidate1);
  await lab.upsertSuite(suite1);

  const run1 = await lab.createRunRequest({
    candidate: candidate1.name,
    suite: suite1.name,
  });
  await lab.updateRunStatus(run1.name, RunStatus.COMPLETED);
  await lab.reportRunResults(run1.name, { passed: 5, failed: 6 });

  const run2 = await lab.createRunRequest({
    candidate: candidate1.name,
    suite: suite1.name,
  });
  await lab.updateRunStatus(run2.name, RunStatus.COMPLETED);
  await lab.reportRunResults(run2.name, { passed: 3, skipped: 7 });

  console.log();
  console.log('=== Sample benchmark ===');
  console.log(yaml.safeDump(benchmark1));

  console.log();
  console.log('=== Sample candidate ===');
  console.log(yaml.safeDump(candidate1));

  console.log();
  console.log('=== Sample suite ===');
  console.log(yaml.safeDump(suite1));

  console.log();
  console.log(`Initiated run ${run1.name}`);
  console.log(`Initiated run ${run2.name}`);
}
