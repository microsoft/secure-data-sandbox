import { createServer, Server } from 'http';
import * as os from 'os';

import { initializeSequelize, SequelizeLaboratory } from '../logic';

// TODO: remove these temporary imports after integration.
import { PipelineRun } from '../logic/sequelize_laboratory/messages';
import { InMemoryQueue } from '../logic/sequelize_laboratory/queue';

import { createApp } from './app';
import { URL } from 'url';
import { SequelizeOptions } from 'sequelize-typescript';

export async function startServer(): Promise<Server> {
  const port = process.env.PORT || 3000;

  // TODO: remove this singleton pattern, parameterize by dialect.
  const options: SequelizeOptions = {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  };
  await initializeSequelize(options);

  const url = new URL(`http://${os.hostname()}:${port}`);
  const serviceURL = url.toString();
  const blobBase = 'http://blobs'; // TODO: plumb real url.
  const queue = new InMemoryQueue<PipelineRun>();
  const lab = new SequelizeLaboratory(serviceURL, blobBase, queue);

  const app = await createApp(lab);

  const server = createServer(app);
  server.listen(port);
  console.log(`Service url is ${serviceURL}.`);
  console.log(`Blob base is ${blobBase}.`);
  console.info(`Laboratory service listening on port ${port}.`);

  return server;
}
