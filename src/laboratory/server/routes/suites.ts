import { Router } from 'express';
import * as asyncHandler from 'express-async-handler';

import { ILaboratory, SuiteType, validate } from '../../logic';

export function createSuiteRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get(
    '',
    asyncHandler(async (req, res) => {
      res.json(await lab.allSuites());
    })
  );

  router.get(
    '/:name',
    asyncHandler(async (req, res) => {
      res.json(await lab.oneSuite(req.params['name']));
    })
  );

  router.put(
    '/:name',
    asyncHandler(async (req, res) => {
      const suite = validate(SuiteType, req.body);
      await lab.upsertSuite(suite);
      res.json(await lab.oneSuite(suite.name));
    })
  );

  return router;
}
