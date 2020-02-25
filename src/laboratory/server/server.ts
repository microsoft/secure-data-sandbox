import { createServer, Server } from 'http';

import { initializeSequelize, SequelizeLaboratory } from '../logic';

import { createApp } from './app';

export async function startServer(): Promise<Server> {
  // TODO: remove this singleton pattern, parameterize by dialect.
  await initializeSequelize();

  const blobBase = 'http://blobs'; // TODO: plumb real url.
  const lab = new SequelizeLaboratory(blobBase);

  const port = process.env.PORT || 3000;

  const app = await createApp(lab);

  const server = createServer(app).listen(port, () =>
    console.info(`Server running on port ${port}`)
  );

  return server;
}

// curl -d '{"name":"benchmark1", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"noel", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl localhost:3000/benchmarks
// curl localhost:3000/benchmarks/benchmark1
