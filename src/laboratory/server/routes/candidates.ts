import { Router } from 'express';

import { CandidateType, ILaboratory, validate } from '../../logic';

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
      const candidate = validate(CandidateType, req.body);
      await lab.upsertCandidate(candidate);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
