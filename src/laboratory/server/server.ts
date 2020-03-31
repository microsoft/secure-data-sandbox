import { createServer, Server } from 'http';

import { initializeSequelize, SequelizeLaboratory } from '../logic';

import { ParseLaboratoryConfiguration } from '../../configuration';
import { GetSequelizeOptions } from '../../database';
import { PipelineRun } from '../../messages';
import { GetQueue } from '../../queue';

import { createApp } from './app';

export async function startServer(): Promise<Server> {
  const config = ParseLaboratoryConfiguration();
  const queue = GetQueue<PipelineRun>(config.queue);

  // initializeSequelize binds Sequelize to the models, effectively becoming a singleton / service locator
  const sequelizeOptions = GetSequelizeOptions(config.database);
  await initializeSequelize(sequelizeOptions);

  const lab = new SequelizeLaboratory(
    config.endpointBaseUrl,
    config.blobContainerUrl,
    queue
  );

  const app = await createApp(lab);

  const server = createServer(app);
  server.listen(config.port);
  console.log(`Service url is ${config.endpointBaseUrl}.`);
  console.log(`Blob base is ${config.blobContainerUrl}.`);
  console.info(`Laboratory service listening on port ${config.port}.`);

  return server;
}
