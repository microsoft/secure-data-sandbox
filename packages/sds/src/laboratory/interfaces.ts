import { either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { DateTime } from 'luxon';

const DateType = new t.Type<Date, string, unknown>(
  'Date',
  (u): u is Date => u instanceof Date,
  (u, c) =>
    either.chain(t.string.validate(u, c), s => {
      const d = DateTime.fromISO(s);
      return d.isValid ? t.success(d.toJSDate()) : t.failure(u, c);
    }),
  a => a.toISOString()
);

// createEnum() from https://github.com/gcanti/io-ts/issues/67

/* eslint-disable @typescript-eslint/no-explicit-any */
const createEnum = <E>(e: any, name: string): t.Type<E> => {
  const keys: any = {};
  Object.keys(e).forEach(k => {
    keys[e[k]] = null;
  });
  return t.keyof(keys, name) as any;
};
/* eslint-enable */

///////////////////////////////////////////////////////////////////////////////
//
// IClientConnectionInfo
//
///////////////////////////////////////////////////////////////////////////////

export const ClientConnectionInfoType = t.union([
  t.type({
    type: t.literal('aad'),
    clientId: t.string,
    authority: t.string,
    scopes: t.array(t.string),
  }),
  t.type({
    type: t.literal('unauthenticated'),
  }),
]);
export type IClientConnectionInfo = t.TypeOf<typeof ClientConnectionInfoType>;

///////////////////////////////////////////////////////////////////////////////
//
// EntityBase
//
///////////////////////////////////////////////////////////////////////////////

export const EntityBaseType = t.intersection([
  t.type({
    name: t.string,
    author: t.string,
    apiVersion: t.string,
  }),
  t.partial({
    createdAt: DateType,
    updatedAt: DateType,
  }),
]);
export type IEntityBase = t.TypeOf<typeof EntityBaseType>;

///////////////////////////////////////////////////////////////////////////////
//
// IBenchmark
//
///////////////////////////////////////////////////////////////////////////////

export enum BenchmarkStageKind {
  CANDIDATE = 'candidate',
  CONTAINER = 'container',
}

const PipelineStageVolumeMountType = t.type({
  name: t.string,
  path: t.string,
  readonly: t.boolean,
});

const CandidatePipelineStageType = t.intersection([
  t.type({
    name: t.string,
    kind: t.literal(BenchmarkStageKind.CANDIDATE),
  }),
  t.partial({
    cmd: t.array(t.string),
    env: t.record(t.string, t.string),
    volumes: t.array(PipelineStageVolumeMountType),
  }),
]);

const ContainerPipelineStageType = t.intersection([
  t.type({
    name: t.string,
    kind: t.literal(BenchmarkStageKind.CONTAINER),
    image: t.string,
  }),
  t.partial({
    cmd: t.array(t.string),
    env: t.record(t.string, t.string),
    volumes: t.array(PipelineStageVolumeMountType),
  }),
]);

const PipelineStageType = t.union([
  CandidatePipelineStageType,
  ContainerPipelineStageType,
]);
export type PipelineStage = t.TypeOf<typeof PipelineStageType>;

export const BenchmarkType = t.intersection([
  EntityBaseType,
  t.interface({
    stages: t.array(PipelineStageType),
  }),
]);
export type IBenchmark = t.TypeOf<typeof BenchmarkType>;

export const BenchmarkArrayType = t.array(BenchmarkType);

///////////////////////////////////////////////////////////////////////////////
//
// ICandidate
//
///////////////////////////////////////////////////////////////////////////////

export const CandidateType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: t.string,
    image: t.string,
  }),
  t.partial({
    env: t.record(t.string, t.string),
  }),
]);
export type ICandidate = t.TypeOf<typeof CandidateType>;

export const CandidateArrayType = t.array(CandidateType);

///////////////////////////////////////////////////////////////////////////////
//
// ISuite
//
///////////////////////////////////////////////////////////////////////////////

const EphemeralSuiteVolumeType = t.intersection([
  t.type({
    name: t.string,
    type: t.literal('ephemeral'),
  }),
  t.partial({
    target: t.undefined,
  }),
]);

const TargetedSuiteVolumeType = t.type({
  name: t.string,
  type: t.string,
  target: t.string,
});

const SuiteVolumeType = t.union([
  TargetedSuiteVolumeType,
  EphemeralSuiteVolumeType,
]);
export type SuiteVolume = t.TypeOf<typeof SuiteVolumeType>;

export const SuiteType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: t.string,
  }),
  t.partial({
    properties: t.record(t.string, t.string),
    volumes: t.array(SuiteVolumeType),
  }),
]);
export type ISuite = t.TypeOf<typeof SuiteType>;

export const SuiteArrayType = t.array(SuiteType);

///////////////////////////////////////////////////////////////////////////////
//
// IRun
//
///////////////////////////////////////////////////////////////////////////////

export enum RunStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

const RunStatusType = createEnum<RunStatus>(RunStatus, 'RunStatus');

export const RunType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: BenchmarkType,
    suite: SuiteType,
    candidate: CandidateType,
    status: RunStatusType,
  }),
]);
export type IRun = t.TypeOf<typeof RunType>;

export const RunArrayType = t.array(RunType);

///////////////////////////////////////////////////////////////////////////////
//
// IRunRequest
//
///////////////////////////////////////////////////////////////////////////////

export const RunRequestType = t.type({
  candidate: t.string,
  suite: t.string,
});
export type IRunRequest = t.TypeOf<typeof RunRequestType>;

///////////////////////////////////////////////////////////////////////////////
//
// IUpdateRunStatus
//
///////////////////////////////////////////////////////////////////////////////

export const UpdateRunStatusType = t.type({
  status: RunStatusType,
});
export type IUpdateRunStatus = t.TypeOf<typeof UpdateRunStatusType>;

///////////////////////////////////////////////////////////////////////////////
//
// Measures
//
///////////////////////////////////////////////////////////////////////////////

export const MeasuresType = t.UnknownRecord;
export type Measures = t.TypeOf<typeof MeasuresType>;

///////////////////////////////////////////////////////////////////////////////
//
// IReportRunResults
//
///////////////////////////////////////////////////////////////////////////////

export const ReportRunResultsType = t.type({
  measures: MeasuresType,
});
export type IReportRunResults = t.TypeOf<typeof ReportRunResultsType>;

///////////////////////////////////////////////////////////////////////////////
//
// IResult
//
///////////////////////////////////////////////////////////////////////////////

export const ResultType = t.intersection([
  EntityBaseType,
  t.type({
    benchmark: t.string,
    suite: t.string,
    candidate: t.string,
    measures: MeasuresType,
  }),
]);
export type IResult = t.TypeOf<typeof ResultType>;

export const ResultArrayType = t.array(ResultType);

///////////////////////////////////////////////////////////////////////////////
//
// ILaboratory
//
///////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ILaboratory {
  allBenchmarks(): Promise<IBenchmark[]>;
  oneBenchmark(name: string): Promise<IBenchmark>;
  upsertBenchmark(benchmark: IBenchmark, name?: string): Promise<void>;

  allCandidates(): Promise<ICandidate[]>;
  oneCandidate(name: string): Promise<ICandidate>;
  upsertCandidate(candidate: ICandidate, name?: string): Promise<void>;

  allSuites(): Promise<ISuite[]>;
  oneSuite(name: string): Promise<ISuite>;
  upsertSuite(suite: ISuite, name?: string): Promise<void>;

  allRuns(): Promise<IRun[]>;
  oneRun(name: string): Promise<IRun>;
  createRunRequest(spec: IRunRequest): Promise<IRun>;
  updateRunStatus(name: string, status: RunStatus): Promise<void>;

  reportRunResults(name: string, measures: Measures): Promise<void>;
  allRunResults(benchmark: string, suite: string): Promise<IResult[]>;
}

///////////////////////////////////////////////////////////////////////////////
//
// Errors
//
///////////////////////////////////////////////////////////////////////////////
export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class IllegalOperationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}
