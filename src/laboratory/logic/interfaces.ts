export const apiVersion = '0.0.1';

// tslint:disable-next-line:interface-name
export interface IEntityBase {
  name: string;
  author: string;
  version: string;

  // jsdoc annotations for typescript-json-schema
  /**
   * @TJS-type object
   * @format date-time
   */
  createdAt?: Date;

  // jsdoc annotations for typescript-json-schema
  /**
   * @TJS-type object
   * @format date-time
   */
  updatedAt?: Date;
}

///////////////////////////////////////////////////////////////////////////////
//
// IBenchmark
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface IBenchmark extends IEntityBase {
  pipelines: IPipeline[];
  columns: ResultColumn[];
}

// tslint:disable-next-line:interface-name
export interface IPipeline {
  mode: string;
  stages: IPipelineStage[];
}

// tslint:disable-next-line:interface-name
export interface IPipelineStage {
  image?: string;
}

export enum ResultColumnType {
  INT = 'integer',
  FLOAT = 'float',
  STRING = 'string',
}

export interface ResultColumn {
  name: string;
  type: ResultColumnType;
}

///////////////////////////////////////////////////////////////////////////////
//
// ISuite
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface ISuite extends IEntityBase {
  benchmark: string;
  mode: string;
}

///////////////////////////////////////////////////////////////////////////////
//
// ICandidate
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface ICandidate extends IEntityBase {
  benchmark: string;
  mode: string;
  image: string;
}

///////////////////////////////////////////////////////////////////////////////
//
// IRunRequest
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:interface-name
export interface IRunRequest {
  candidate: string;
  suite: string;
}

///////////////////////////////////////////////////////////////////////////////
//
// IRun
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface IRun extends IEntityBase {
  benchmark: IBenchmark;
  suite: ISuite;
  candidate: ICandidate;
  blob: string;
  status: RunStatus;
}

export enum RunStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// tslint:disable-next-line:interface-name
export interface UpdateRunStatusRequestBody {
  status: RunStatus;
}

export interface ReportRunResultsRequestBody {
  measures: Measures;
}

///////////////////////////////////////////////////////////////////////////////
//
// IResult
//
///////////////////////////////////////////////////////////////////////////////

export type Measures = object;

// tslint:disable-next-line:interface-name
export interface IResult extends IEntityBase {
  benchmark: string;
  mode: string;
  suite: string;
  candidate: string;
  measures: Measures;
}

///////////////////////////////////////////////////////////////////////////////
//
// ILaboratory
//
///////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line:interface-name
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
  // allRunResults(benchmark: string, mode: string): Promise<IResult>;
}
