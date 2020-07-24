import { Router } from 'express';

import { BenchmarkType, ILaboratory, validate } from '../../logic';

export function createBenchmarkRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res) => {
    res.json(await lab.allBenchmarks());
  });

  router.get('/:name', async (req, res) => {
    res.json(await lab.oneBenchmark(req.params['name']));
  });

  router.put('/:name', async (req, res) => {
    const benchmark = validate(BenchmarkType, req.body);
    await lab.upsertBenchmark(benchmark);
    res.json(await lab.oneBenchmark(benchmark.name));
  });

  return router;
}
