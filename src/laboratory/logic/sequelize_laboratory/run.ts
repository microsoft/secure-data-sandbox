import { v1 } from 'uuid';
import { URL } from 'url';

import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  IResult,
  IRun,
  IRunRequest,
  Measures,
  RunStatus,
} from '../interfaces';

import { PipelineRun, PipelineStage } from './messages';
import { Benchmark, Candidate, Suite, Run, Result } from './models';
import { normalizeName } from './normalize';
import { IQueue } from './queue';

export function normalizeRunRequest(runRequest: IRunRequest): IRunRequest {
  return {
    ...runRequest,
    candidate: normalizeName(runRequest.candidate),
    suite: normalizeName(runRequest.suite),
  };
}

export async function processRunRequest(
  server: string,
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

  // TODO: consider moving name generation to normalize.ts.
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
  const message = createMessage(
    server,
    blobURI.toString(),
    name,
    benchmark,
    candidate,
    pipeline
  );
  await queue.enqueue(message);

  return result;
}

export async function processRunStatus(
  name: string,
  status: RunStatus
): Promise<void> {
  // Verify that named run exists in the database.
  // DESIGN NOTE: this is a friendly, convenience check that warns the user
  // of a referential integrity problem at the time of the check. It makes
  // no attempt to guard against race conditions.
  // TODO: REVIEW: why not just rely on update() failing?
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

export async function processRunResults(
  name: string,
  measures: Measures
): Promise<void> {
  // Find run in the database.
  // TODO: consider using transaction here to protect against race condition
  // where run is updated between the return of findOne() and the upsert().
  const run = await Run.findOne({
    where: { name },
  });
  if (!run) {
    const message = `Unknown run id ${name}`;
    throw new TypeError(message);
  }

  // Upsert to Results table.
  // TODO: REVIEW: is it ok that the upsert can update all of the run-related
  // fields on subsequent calls to processRunResults? This could bring in new
  // values for these fields, if run were to change in the interim period.
  // Perhaps this should do a create(), instead.
  const results: IResult = {
    name: run.name,
    author: run.author,
    version: run.version,
    benchmark: run.benchmark.name,
    mode: run.suite.mode,
    suite: run.suite.name,
    candidate: run.candidate.name,
    measures,
  };

  await Result.upsert(results);
}

function createMessage(
  server: string,
  blobPrefix: string,
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

  // const blobPrefix = `runs/${name}`;
  const statusEndpoint = new URL(`runs/${name}`, server);
  const resultsEndpoint = new URL(`runs/${name}/results`, server);

  const message: PipelineRun = {
    name,
    blobPrefix,
    statusEndpoint: statusEndpoint.toString(),
    resultsEndpoint: resultsEndpoint.toString(),
    stages,
  };
  return message;
}
