// tslint:disable-next-line:interface-name
export interface IEntityBase {
  name: string;
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

///////////////////////////////////////////////////////////////////////////////
//
// IBenchmark
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface IBenchmark extends IEntityBase {
  pipelines: IPipeline[];
  // TODO: results table definition.
}

// tslint:disable-next-line:interface-name
export interface IPipeline {
  mode: string;
  stages: PipelineStage[];
}

type PipelineStage = ICandidateStage | IContainerStage;

// tslint:disable-next-line:interface-name
export interface ICandidateStage {}

// tslint:disable-next-line:interface-name
export interface IContainerStage {
  image: string;
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
}

///////////////////////////////////////////////////////////////////////////////
//
// IRunRequest
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line:interface-name
export interface IRun extends IEntityBase {
  benchmark: IBenchmark;
  suite: ISuite;
  candidate: ICandidate;
  status: RunStatus;
}

export enum RunStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

///////////////////////////////////////////////////////////////////////////////
//
// Results will be dynamically typed.
//
///////////////////////////////////////////////////////////////////////////////
