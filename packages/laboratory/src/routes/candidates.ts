require('express-async-errors');
import { Router } from 'express';

import { CandidateType, ILaboratory, validate } from '@microsoft/sds';

export function createCandidateRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('/candidates', async (req, res) => {
    res.json(await lab.allCandidates());
  });

  router
    .route('/candidates/:name')
    .get(async (req, res) => {
      res.json(await lab.oneCandidate(req.params['name']));
    })
    .put(async (req, res) => {
      const candidate = validate(CandidateType, req.body);
      await lab.upsertCandidate(candidate);
      res.json(await lab.oneCandidate(candidate.name));
    });

  return router;
}
