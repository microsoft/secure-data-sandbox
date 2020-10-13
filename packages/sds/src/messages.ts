// Data contracts for queue messages

export type PipelineRun = Readonly<{
  name: string;
  laboratoryEndpoint: string;
  stages: ReadonlyArray<PipelineRunStage>;
  // TODO: consider elevating volumes to top-level property
}>;

export interface PipelineRunStage {
  name: string;
  kind: string;
  image: string;
  cmd?: string[];
  env?: Readonly<Record<string, string>>;
  volumes?: ReadonlyArray<PipelineRunStageVolume>;
}

export interface PipelineRunStageVolume {
  type: string;
  target: string;
  name: string;
  // TODO: allow `source` as optional for type: 'ephemeral'
  source: string | undefined;
  readonly: boolean;
}
