require('express-async-errors');
import { Router } from 'express';

import { ILaboratory, SuiteType, validate } from '../../logic';

export function createSuiteRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('/suites', async (req, res) => {
    res.json(await lab.allSuites());
  });

  router
    .route('/suites/:name')
    .get(async (req, res) => {
      res.json(await lab.oneSuite(req.params['name']));
    })
    .put(async (req, res) => {
      const suite = validate(SuiteType, req.body);
      await lab.upsertSuite(suite);
      res.json(await lab.oneSuite(suite.name));
    });

  return router;
}
