import { Router } from 'express';

import { ILaboratory, SuiteType, validate } from '../../logic';

export function createSuiteRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res, next) => {
    try {
      res.json(await lab.allSuites());
    } catch (e) {
      next(e);
    }
  });

  router.get('/:name', async (req, res, next) => {
    try {
      res.json(await lab.oneSuite(req.params['name']));
    } catch (e) {
      next(e);
    }
  });

  router.put('/:name', async (req, res, next) => {
    try {
      const suite = validate(SuiteType, req.body);
      await lab.upsertSuite(suite);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
