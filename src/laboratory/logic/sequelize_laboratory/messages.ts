// TODO: remove this file after integration.
// This file actually belongs in src/worker.

// Data contracts for queue messages

export interface PipelineRun
  extends Readonly<{
    name: string;
    blobPrefix: string;
    statusEndpoint: string;
    resultsEndpoint: string;
    stages: ReadonlyArray<PipelineStage>;
  }> {}

export interface PipelineStage {
  name: string;
  image: string;
  cmd?: string[];
  env?: Readonly<{
    [key: string]: string;
  }>;
  volumes?: ReadonlyArray<{
    target: string;
    source: string;
    readonly: boolean;
  }>;
}
