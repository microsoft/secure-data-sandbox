import { Router } from 'express';
import * as asyncHandler from 'express-async-handler';

import { BenchmarkType, ILaboratory, validate } from '../../logic';

export function createBenchmarkRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get(
    '',
    asyncHandler(async (req, res, next) => {
      res.json(await lab.allBenchmarks());
    })
  );

  router.get(
    '/:name',
    asyncHandler(async (req, res) => {
      res.json(await lab.oneBenchmark(req.params['name']));
    })
  );

  router.put(
    '/:name',
    asyncHandler(async (req, res) => {
      const benchmark = validate(BenchmarkType, req.body);
      await lab.upsertBenchmark(benchmark);
      res.json(await lab.oneBenchmark(benchmark.name));
    })
  );

  return router;
}
