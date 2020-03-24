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
      console.log(`Before lab.oneBenchmark()`);
      res.json(await lab.oneBenchmark(req.params['name']));
      console.log(`After lab.oneBenchmark()`);
    } catch (e) {
      // console.log(`xxx Caught throw from lab.oneBenchmark()`);
      // res.status(404).send(`Benchmark ${req.params['name']} not found.`);
      // // res.json({});
      // // res.statusMessage = `Benchmark ${req.params['name']} not found.`;
      // // res.sendStatus(404);
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
