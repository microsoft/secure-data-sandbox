import { Router } from 'express';

import { ILaboratory, validateRunRequest } from '../../logic';

export function createRunRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res, next) => {
    try {
      res.json(await lab.allRuns());
    } catch (e) {
      next(e);
    }
  });

  router.get('/:name', async (req, res, next) => {
    try {
      res.json(await lab.oneRun(req.params['name']));
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const spec = validateRunRequest(req.body);
      const run = await lab.createRun(spec);
      res.json(run);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
