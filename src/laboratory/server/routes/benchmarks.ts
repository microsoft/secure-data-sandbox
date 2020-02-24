import { Router } from 'express';

import { ILaboratory, validateBenchmark } from '../../logic';

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
      const spec = validateBenchmark(req.body);
      await lab.upsertBenchmark(spec);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
