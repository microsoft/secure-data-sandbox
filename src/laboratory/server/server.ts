import { createServer, Server } from 'http';

import { initializeSequelize, SequelizeLaboratory } from '../logic';

import { createApp } from './app';

import { GetSequelize } from '../../database';
import { GetQueue } from '../../queue';
import { ParseLaboratoryConfiguration } from '../../configuration';
import { PipelineRun } from '../../messages';

export async function startServer(): Promise<Server> {
  const config = ParseLaboratoryConfiguration();
  const queue = GetQueue<PipelineRun>(config.queue);

  // initializeSequelize binds Sequelize to the models, effectively becoming a singleton / service locator
  const sequelize = GetSequelize(config.database);
  await initializeSequelize(sequelize);

  const lab = new SequelizeLaboratory(
    config.endpointBaseUrl,
    config.blobContainerUrl,
    queue
  );
  const app = await createApp(lab);
  const server = createServer(app);
  server.listen(config.port);
  console.info(`Laboratory service listening on port ${config.port}.`);

  return server;
}
