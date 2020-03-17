import { createServer } from 'http';

import { GetSequelize } from '../database';
import { GetQueue } from '../queue';
import { ParseLaboratoryConfiguration } from '../configuration';
import { PipelineRun } from '../messages';

import { initializeSequelize, SequelizeLaboratory } from './logic';
import { createApp } from './server';

async function main() {
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
  const port = process.env.PORT || 3000;
  const app = await createApp(lab);

  const server = createServer(app).listen(port, () =>
    console.info(`Server running on port ${port}`)
  );

  return server;
}

main().catch(e => console.error(e));
