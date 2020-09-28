import { Router } from 'express';

import { BenchmarkType, ILaboratory, validate } from '@microsoft/sds';

export function createBenchmarkRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('/benchmarks', async (req, res) => {
    res.json(await lab.allBenchmarks());
  });

  router
    .route('/benchmarks/:name')
    .get(async (req, res) => {
      res.json(await lab.oneBenchmark(req.params['name']));
    })
    .put(async (req, res) => {
      const benchmark = validate(BenchmarkType, req.body);
      await lab.upsertBenchmark(benchmark);
      res.json(await lab.oneBenchmark(benchmark.name));
    });

  return router;
}
