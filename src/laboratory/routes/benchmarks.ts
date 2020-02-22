import { Router } from 'express';

import { IBenchmark } from '../interfaces';
import { Benchmark } from '../models/benchmark';

export const benchmarks = Router();

benchmarks.get('', async (req, res, next) => {
  try {
    res.json(await Benchmark.findAll());
  } catch (e) {
    next(e);
  }
});

// TODO: investigate scope
//   res.json(await Benchmark.scope(req.query['scope']).findAll());
//   May be useful for getting just names (instead of complete specs)

benchmarks.get('/:name', async (req, res, next) => {
  try {
    const benchmark = await Benchmark.findByPk(req.params['name']);
    res.json(benchmark);
  } catch (e) {
    next(e);
  }
});

// TODO: should we post to / in order to avoid name mismatch?
benchmarks.put('/:name', async (req, res, next) => {
  try {
    const spec = Benchmark.validate(req.body, req.params['name']);

    await Benchmark.upsert<Benchmark>(spec);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});
