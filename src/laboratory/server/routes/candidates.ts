import { Router } from 'express';

import { CandidateType, ILaboratory, validate } from '../../logic';

export function createCandidateRouter(lab: ILaboratory): Router {
  const router = Router();

  router.get('', async (req, res) => {
    res.json(await lab.allCandidates());
  });

  router.get('/:name', async (req, res) => {
    res.json(await lab.oneCandidate(req.params['name']));
  });

  router.put('/:name', async (req, res) => {
    const candidate = validate(CandidateType, req.body);
    await lab.upsertCandidate(candidate);
    res.json(await lab.oneCandidate(candidate.name));
  });

  return router;
}
