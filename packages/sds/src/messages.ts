// Data contracts for queue messages

export type PipelineRun = Readonly<{
  name: string;
  statusEndpoint: string;
  resultsEndpoint: string;
  stages: ReadonlyArray<PipelineRunStage>;
}>;

export interface PipelineRunStage {
  name: string;
  image: string;
  cmd?: string[];
  env?: Readonly<{
    [key: string]: string;
  }>;
  volumes?: ReadonlyArray<{
    type: string;
    target: string;
    source: string | undefined;
    readonly: boolean;
  }>;
}
