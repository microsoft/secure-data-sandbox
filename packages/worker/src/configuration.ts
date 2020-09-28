import * as env from 'env-var';

export interface ArgoWorkerConfiguration {
  successfulRunGCSeconds: number;
  storageClassName?: string;
}

export function ParseArgoWorkerConfiguration(): ArgoWorkerConfiguration {
  return {
    successfulRunGCSeconds: env
      .get('SUCCESSFUL_RUN_GC_SECONDS')
      .default(300)
      .asInt(),
    storageClassName: env.get('STORAGE_CLASS_NAME').asString(),
  };
}
