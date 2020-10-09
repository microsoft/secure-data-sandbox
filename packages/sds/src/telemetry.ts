import * as appInsights from 'applicationinsights';

export enum Events {
  QueueCreated = 'queueCreated',
  QueueMessageCompleted = 'queueMessageCompleted',
  QueueMessageCreated = 'queueMessageCreated',
  QueueMessageDequeued = 'queueMessageDequeued',
  QueueMessageUnprocessable = 'queueMessageUnprocessable',
}

export function InitTelemetry() {
  try {
    appInsights.setup().start();
  } catch (err) {
    console.warn('Warning: Could not initialize telemetry');
    appInsights.setup('00000000-0000-0000-0000-000000000000').start();
    appInsights.defaultClient.config.disableAppInsights = true;
    if (err.message) {
      console.warn(`Warning: ${err.message}`);
    }
  }
}
