import { v1 } from 'uuid';
import mustache = require('mustache');

// Don't HTML escape output
mustache.escape = text => text;
// Use single braces
mustache.tags = ['{', '}'];

import {
  EntityNotFoundError,
  IllegalOperationError,
  IResult,
  IRun,
  IRunRequest,
  Measures,
  RunStatus,
  BenchmarkStageKind,
  PipelineRun,
  PipelineRunStage,
  normalizeName,
  IQueue,
  PipelineRunStageVolume,
} from '@microsoft/sds';

import { Benchmark, Candidate, Suite, Run, Result } from './models';

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
  queue: IQueue<PipelineRun>
): Promise<Run> {
  // Verify that referenced candidate exists.
  const candidate = await Candidate.findOne({
    where: { name: runRequest.candidate },
  });
  if (!candidate) {
    const message = `Run request references unknown candidate ${runRequest.candidate}`;
    throw new IllegalOperationError(message);
  }

  // Verify that referenced suite exists.
  const suite = await Suite.findOne({ where: { name: runRequest.suite } });
  if (!suite) {
    const message = `Run request references unknown suite ${runRequest.suite}`;
    throw new IllegalOperationError(message);
  }

  // Verify that candidate and suite reference same benchmark.
  if (candidate.benchmark !== suite.benchmark) {
    const message = `Candidate benchmark "${candidate.benchmark}" doesn't match suite benchmark "${suite.benchmark}"`;
    throw new IllegalOperationError(message);
  }

  // Verify that referenced benchmark exists.
  const benchmark = await Benchmark.findOne({
    where: { name: candidate.benchmark },
  });
  if (!benchmark) {
    const message = `Candidate references unknown benchmark ${candidate.benchmark}`;
    throw new IllegalOperationError(message);
  }

  //
  // All ok. Create the run.
  //

  // TODO: consider moving name generation to normalize.ts.
  const name = v1();

  const run: IRun = {
    name,
    author: 'unknown', // TODO: fill in name
    apiVersion: 'v1alpha1',
    status: RunStatus.CREATED,
    benchmark,
    candidate,
    suite,
  };

  // Create the run record in the database.
  const result = await Run.create(run);

  // Queue the run request.
  const message = createMessage(server, name, result);
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
    throw new EntityNotFoundError(message);
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
    throw new EntityNotFoundError(message);
  }

  // Upsert to Results table.
  // TODO: REVIEW: is it ok that the upsert can update all of the run-related
  // fields on subsequent calls to processRunResults? This could bring in new
  // values for these fields, if run were to change in the interim period.
  // Perhaps this should do a create(), instead.
  const results: IResult = {
    name: run.name,
    author: run.author,
    apiVersion: 'v1alpha1',
    benchmark: run.benchmark.name,
    suite: run.suite.name,
    candidate: run.candidate.name,
    measures,
  };

  await Result.upsert(results);
}

function createMessage(server: string, name: string, run: IRun): PipelineRun {
  const benchmark = run.benchmark;
  const candidate = run.candidate;
  const suite = run.suite;

  const templateValues = {
    laboratoryEndpoint: server,
    run,
    benchmark,
    candidate,
    suite,
  };

  const stages = benchmark.stages.map(stage => {
    const image =
      stage.kind === BenchmarkStageKind.CANDIDATE
        ? candidate.image
        : stage.image;

    const volumes = stage.volumes?.reduce(
      (result: PipelineRunStageVolume[], v) => {
        const sourceVolume = suite.volumes?.filter(sv => sv.name === v.name)[0];
        if (sourceVolume) {
          result.push({
            type: sourceVolume.type,
            target: v.path,
            source: sourceVolume.target,
            readonly: v.readonly,
            name: v.name,
          });
        }

        return result;
      },
      []
    );

    const runStage: PipelineRunStage = {
      name: stage.name,
      kind: stage.kind,
      image,
      volumes,
    };

    // Add container arguments
    if (stage.cmd) {
      runStage.cmd = stage.cmd.map(s => mustache.render(s, templateValues));
    }

    // Add environment variables specified by the benchmark
    if (stage.env) {
      runStage.env = stage.env;
    }

    // Add any self-configured environment vars that the candidate has specified
    if (stage.kind === BenchmarkStageKind.CANDIDATE && candidate.env) {
      runStage.env = { ...runStage.env, ...candidate.env };
    }

    // Apply transforms
    for (const env in runStage.env) {
      runStage.env[env] = mustache.render(runStage.env[env], templateValues);
    }

    return runStage;
  });

  const message: PipelineRun = {
    name,
    laboratoryEndpoint: server,
    stages,
  };
  return message;
}
