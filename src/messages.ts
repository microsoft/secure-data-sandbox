// Data contracts for queue messages

export interface PipelineRun
  extends Readonly<{
    id: string;
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
