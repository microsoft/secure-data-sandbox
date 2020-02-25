import * as env from 'env-var';
import { QueueMode, QueueConfiguration } from './queue';

/**
 * Retrieve a QueueConfiguration from the current execution environment.
 */
export function ParseQueueConfiguration(): QueueConfiguration {
  const mode = env
    .get('QUEUE_MODE')
    .default(QueueMode.Azure)
    .asEnum(Object.values(QueueMode)) as QueueMode;

  const endpoint = env
    .get('QUEUE_ENDPOINT')
    .required()
    .asUrlString();

  return {
    mode,
    endpoint,
  };
}
