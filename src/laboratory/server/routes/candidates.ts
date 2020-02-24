import { Router } from 'express';

import { ILaboratory, validateCandidate } from '../../logic';

export function createCandidateRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res, next) => {
    try {
      res.json(await lab.allCandidates());
    } catch (e) {
      next(e);
    }
  });

  router.get('/:name', async (req, res, next) => {
    try {
      res.json(await lab.oneCandidate(req.params['name']));
    } catch (e) {
      next(e);
    }
  });

  router.put('/:name', async (req, res, next) => {
    try {
      const spec = validateCandidate(req.body);
      await lab.upsertCandidate(spec);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
