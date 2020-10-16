// Data contracts for queue messages

export type PipelineRun = {
  name: string;
  laboratoryEndpoint: string;
  stages: PipelineRunStage[];
  // TODO: consider elevating volumes to top-level property
};

export interface PipelineRunStage {
  name: string;
  kind: string;
  image: string;
  cmd?: string[];
  env?: Record<string, string>;
  volumes?: PipelineRunStageVolume[];
}

export interface PipelineRunStageVolume {
  type: string;
  target: string;
  name: string;
  // TODO: allow `source` as optional for type: 'ephemeral'
  source: string | undefined;
  readonly: boolean;
}
