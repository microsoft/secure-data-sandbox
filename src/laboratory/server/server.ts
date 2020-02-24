import { createServer } from 'http';

import { app } from './app';
import { initializeSequelize } from '../sequelize';

const port = process.env.PORT || 3000;

(async () => {
  await initializeSequelize();

  createServer(app).listen(port, () =>
    console.info(`Server running on port ${port}`)
  );
})();

// curl -d '{"name":"benchmark1", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"mike", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl -d '{"name":"one", "author":"noel", "version":"v1", "image":"image1", "pipelines":[]}' -H "Content-Type: application/json" -X PUT localhost:3000/benchmarks/one
// curl localhost:3000/benchmarks
// curl localhost:3000/benchmarks/benchmark1
