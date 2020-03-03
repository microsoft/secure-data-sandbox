import { v1 } from 'uuid';
import { URL } from 'url';

import { Benchmark, Candidate, Suite, Run } from './models';
import { normalizeName } from './normalize';
import { IQueue } from './queue';

import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  IRun,
  IRunRequest,
  RunStatus,
} from '../interfaces';

import { PipelineRun, PipelineStage } from './messages';
import { runInContext } from 'vm';

export function normalizeRunRequest(runRequest: IRunRequest): IRunRequest {
  return {
    ...runRequest,
    candidate: normalizeName(runRequest.candidate),
    suite: normalizeName(runRequest.suite),
  };
}

export async function processRunRequest(
  runRequest: IRunRequest,
  runBlobBase: string,
  queue: IQueue<PipelineRun>
): Promise<Run> {
  // Verify that referenced candidate exists.
  const candidate = await Candidate.findOne({
    where: { name: runRequest.candidate },
  });
  if (!candidate) {
    const message = `Run request references unknown candidate ${runRequest.candidate}`;
    throw new TypeError(message);
  }

  // Verify that referenced suite exists.
  const suite = await Suite.findOne({ where: { name: runRequest.suite } });
  if (!suite) {
    const message = `Run request references unknown suite ${runRequest.suite}`;
    throw new TypeError(message);
  }

  // Verify that candidate and suite reference same benchmark.
  if (candidate.benchmark !== suite.benchmark) {
    const message = `Candidate benchmark "${candidate.benchmark}" doesn't match suite benchmark "${suite.benchmark}"`;
    throw new TypeError(message);
  }

  // Verify that candidate and suite reference same mode.
  if (candidate.mode !== suite.mode) {
    const message = `Candidate mode "${candidate.mode}" doesn't match suite mode "${suite.mode}"`;
    throw new TypeError(message);
  }

  // Verify that referenced benchmark exists.
  const benchmark = await Benchmark.findOne({
    where: { name: candidate.benchmark },
  });
  if (!benchmark) {
    const message = `Candidate references unknown benchmark ${candidate.benchmark}`;
    throw new TypeError(message);
  }

  // Find the pipeline for the candidate's mode.
  let pipeline: IPipeline | undefined;
  for (const p of benchmark.pipelines) {
    if (p.mode === candidate.mode) {
      pipeline = p;
      break;
    }
  }
  if (!pipeline) {
    const message = `Candidate references unknown mode "${candidate.mode}"`;
    throw new TypeError(message);
  }

  //
  // All ok. Create the run.
  //

  const name = v1();
  const blobURI: URL = new URL(name, runBlobBase);

  const run: IRun = {
    name,
    author: 'unknown', // TODO: fill in name
    version: apiVersion,
    status: RunStatus.CREATED,
    blob: blobURI.toString(),
    benchmark,
    candidate,
    suite,
  };

  // Create the run record in the database.
  const result = await Run.create(run);

  // Queue the run request.
  const message = createMessage(name, benchmark, candidate, pipeline);
  await queue.enqueue(message);

  return result;
}

export async function updateRunStatus(
  name: string,
  status: RunStatus
): Promise<void> {
  // Verify that RunStatus is legal.
  if (!Object.keys(RunStatus).includes(status)) {
    const message = `Illegal run status "${status}"`;
    throw new TypeError(message);
  }

  // Find run in db
  const run = await Run.findOne({
    where: { name },
  });
  if (!run) {
    const message = `Unknown run id ${name}`;
    throw new TypeError(message);
  }

  // Update its status field
  await Run.update({ status }, { where: { name } });
}

export async function reportResults(
  name: string,
  results: object
): Promise<void> {
  // Find run in db
  const run = await Run.findOne({
    where: { name },
  });
  if (!run) {
    const message = `Unknown run id ${name}`;
    throw new TypeError(message);
  }

  // Get run's benchmark
  const benchmark = await Benchmark.findOne({
    where: { name: run.benchmark.name },
  });
  if (!benchmark) {
    const message = `Run references unknown benchmark ${run.benchmark.name}`;
    throw new TypeError(message);
  }

  // Get model for results table
  // Upsert result row
  throw new Error('Method not implemented.');
}

function createMessage(
  name: string,
  b: IBenchmark,
  c: ICandidate,
  pipeline: IPipeline
): PipelineRun {
  const stages = pipeline.stages.map(s => {
    const name = s.image ? 'benchmark' : 'candidate';
    const image = s.image || c.image;

    // TODO implement cmd, env, volumes.

    const stage: PipelineStage = { name, image };
    return stage;
  });

  const message: PipelineRun = { name, stages };
  return message;
}
