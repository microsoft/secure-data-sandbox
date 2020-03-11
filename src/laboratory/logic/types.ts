import * as t from 'io-ts';

// import { either } from 'fp-ts/lib/Either'
// import { ThrowReporter } from "io-ts/lib/ThrowReporter";

// tslint:disable-next-line:variable-name
const Date2 = new t.Type<Date, Date, unknown>(
  'Date2',
  (input: unknown): input is Date => input instanceof Date,
  // `t.success` and `t.failure` are helpers used to build `Either` instances
  (input, context) =>
    input instanceof Date ? t.success(input) : t.failure(input, context),
  // `A` and `O` are the same, so `encode` is just the identity function
  t.identity
);

///////////////////////////////////////////////////////////////////////////////
//
// EntityBase
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:variable-name
export const EntityBaseType = t.intersection([
  t.type({
    name: t.string,
    author: t.string,
    version: t.string,
  }),
  t.partial({
    createdAt: Date2,
    updatedAt: Date2,
  }),
]);
export type EntityBase = t.TypeOf<typeof EntityBaseType>;

///////////////////////////////////////////////////////////////////////////////
//
// IBenchmark
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:variable-name
const PipelineStageType = t.partial({
  image: t.string,
});
type PipelineStage = t.TypeOf<typeof PipelineStageType>;

// tslint:disable-next-line:variable-name
export const PipelineType = t.type({
  mode: t.string,
  stages: t.array(PipelineStageType),
});
export type IPipeline = t.TypeOf<typeof PipelineType>;

// tslint:disable-next-line:variable-name
export const BenchmarkType = t.intersection([
  EntityBaseType,
  t.interface({
    pipelines: t.array(PipelineType),
  }),
]);
export type IBenchmark = t.TypeOf<typeof BenchmarkType>;

///////////////////////////////////////////////////////////////////////////////
//
// ICandidate
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:variable-name
export const CandidateType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: t.string,
    mode: t.string,
    image: t.string,
  }),
]);
export type ICandidate = t.TypeOf<typeof CandidateType>;

///////////////////////////////////////////////////////////////////////////////
//
// ISuite
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:variable-name
export const SuiteType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: t.string,
    mode: t.string,
  }),
]);
export type ISuite = t.TypeOf<typeof SuiteType>;

///////////////////////////////////////////////////////////////////////////////
//
// IRun
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:no-any
export const createEnum = <E>(e: any, name: string): t.Type<E> => {
  // tslint:disable-next-line:no-any
  const keys: any = {};
  Object.keys(e).forEach(k => {
    keys[e[k]] = null;
  });
  // tslint:disable-next-line:no-any
  return t.keyof(keys, name) as any;
};

// enum KeysT {
//   foo = 'fooValue',
//   bar = 'barValue'
// }
// // tslint:disable-next-line:variable-name
// const KeysType = createEnum<KeysT>(KeysT, 'Keys')
// type Keys = t.TypeOf<typeof KeysType>

export enum RunStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
// tslint:disable-next-line:variable-name
const RunStatusType = createEnum<RunStatus>(RunStatus, 'RunStatus');
//type RST = t.TypeOf<typeof RunStatusType>

// // tslint:disable-next-line:variable-name
// const RunStatusType = t.keyof({
//   created: null,
//   running: null,
//   completed: null,
//   failed: null
// })
// export type RunStatus2 = t.TypeOf<typeof RunStatusType>;

// tslint:disable-next-line:variable-name
export const RunType = t.intersection([
  EntityBaseType,
  t.interface({
    benchmark: BenchmarkType,
    suite: SuiteType,
    candidate: CandidateType,
    blob: t.string,
    status: RunStatusType,
  }),
]);
export type IRun = t.TypeOf<typeof RunType>;

///////////////////////////////////////////////////////////////////////////////
//
// IRunRequest
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:variable-name
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
// tslint:disable-next-line:variable-name
export const UpdateRunStatusType = t.type({
  status: RunStatusType,
});
export type IUpdateRunStatus = t.TypeOf<typeof UpdateRunStatusType>;

///////////////////////////////////////////////////////////////////////////////
//
// Measures
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:variable-name
export const MeasuresType = t.UnknownRecord;
// export const MeasuresType = t.object;
export type Measures = t.TypeOf<typeof MeasuresType>;

///////////////////////////////////////////////////////////////////////////////
//
// IReportRunResults
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:variable-name
export const ReportRunResultsType = t.type({
  measures: MeasuresType,
});
export type IReportRunResults = t.TypeOf<typeof ReportRunResultsType>;
