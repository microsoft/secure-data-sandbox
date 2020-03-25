import { Router } from 'express';

import { BenchmarkType, ILaboratory, validate } from '../../logic';

export function createBenchmarkRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res, next) => {
    try {
      res.json(await lab.allBenchmarks());
    } catch (e) {
      next(e);
    }
  });

  router.get('/:name', async (req, res, next) => {
    try {
      res.json(await lab.oneBenchmark(req.params['name']));
    } catch (e) {
      next(e);
    }
  });

  router.put('/:name', async (req, res, next) => {
    try {
      const benchmark = validate(BenchmarkType, req.body);
      await lab.upsertBenchmark(benchmark);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
