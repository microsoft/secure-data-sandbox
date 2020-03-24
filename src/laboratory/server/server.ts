import { createServer, Server } from 'http';
import * as os from 'os';

import { initializeSequelize, SequelizeLaboratory } from '../logic';

// TODO: remove these temporary imports after integration.
import { PipelineRun } from '../logic/sequelize_laboratory/messages';
import { InMemoryQueue } from '../logic/sequelize_laboratory/queue';

import { createApp } from './app';
import { URL } from 'url';

export async function startServer(): Promise<Server> {
  const port = process.env.PORT || 3000;

  // TODO: remove this singleton pattern, parameterize by dialect.
  await initializeSequelize();

  const url = new URL(`http://${os.hostname()}:${port}`);
  const serviceURL = url.toString();
  const blobBase = 'http://blobs'; // TODO: plumb real url.
  const queue = new InMemoryQueue<PipelineRun>();
  const lab = new SequelizeLaboratory(serviceURL, blobBase, queue);

  const app = await createApp(lab);

  const server = createServer(app);
  server.listen(port);
  console.info(`Laboratory service listening on port ${port}.`);

  return server;
}

// curl -d '{"name":"benchmark1", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"noel", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl localhost:3000/benchmarks
// curl localhost:3000/benchmarks/benchmark1
