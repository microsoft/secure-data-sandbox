import { createServer } from 'http';

import { GetSequelize } from '../database';
import { GetQueue } from '../queue';
import {
  ParseQueueConfiguration,
  ParseDatabaseConfiguration,
} from '../configuration';
import { PipelineRun } from '../messages';

import { initializeSequelize, SequelizeLaboratory } from './logic';
import { createApp } from './server';

async function main() {
  const blobBase = 'http://blobs'; // TODO: plumb real url.
  const queueConfig = ParseQueueConfiguration();
  const queue = GetQueue<PipelineRun>(queueConfig);

  // initializeSequelize binds Sequelize to the models, effectively becoming a singleton / service locator
  const dbConfig = ParseDatabaseConfiguration();
  const sequelize = GetSequelize(dbConfig);
  await initializeSequelize(sequelize);

  const lab = new SequelizeLaboratory('http://localhost:3000', blobBase, queue); // TODO: plumb real url.
  const port = process.env.PORT || 3000;
  const app = await createApp(lab);

  const server = createServer(app).listen(port, () =>
    console.info(`Server running on port ${port}`)
  );

  return server;
}

main().catch(e => console.error(e));
