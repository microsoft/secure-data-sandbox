// Data contracts for queue messages

export type PipelineRun = Readonly<{
  name: string;
  statusEndpoint: string;
  resultsEndpoint: string;
  stages: ReadonlyArray<PipelineRunStage>;
  // TODO: consider elevating volumes to top-level property
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
    name: string;
    // TODO: allow `source` as optional for type: 'ephemeral'
    source: string | undefined;
    readonly: boolean;
    properties?: Readonly<{
      [key: string]: string;
    }>;
  }>;
}
