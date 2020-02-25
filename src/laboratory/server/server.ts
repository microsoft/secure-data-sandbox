import { createServer, Server } from 'http';

import { createApp } from './app';

export async function startServer(): Promise<Server> {
  const port = process.env.PORT || 3000;

  const app = await createApp();

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
