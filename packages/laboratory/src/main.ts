#!/usr/bin/env node
import { PipelineRun, GetQueue, InitTelemetry } from '@microsoft/sds';
import { ParseLaboratoryConfiguration } from './configuration';
import { GetSequelizeOptions } from './database';
import {
  initializeSequelize,
  SequelizeLaboratory,
} from './sequelize_laboratory';
import { defaultClient as telemetryClient, setup } from 'applicationinsights';
import { Events } from './telemetry';

import { createApp } from './app';

async function main() {
  InitTelemetry();

  const config = await ParseLaboratoryConfiguration();
  const queue = GetQueue<PipelineRun>(config.queue);

  // initializeSequelize binds Sequelize to the models, effectively becoming a singleton / service locator
  const sequelizeOptions = GetSequelizeOptions(config.database);
  await initializeSequelize(sequelizeOptions);

  const lab = new SequelizeLaboratory(config.endpointBaseUrl, queue);

  const app = await createApp(lab, config.auth);
  app.listen(config.port, () => {
    console.log('Starting SDS laboratory service.');
    console.log(`Service url is ${config.endpointBaseUrl}.`);
    console.info(`Laboratory service listening on port ${config.port}.`);

    telemetryClient.trackEvent({
      name: Events.LaboratoryStarted,
    });
  });
}

main().catch(e => console.error(e));
