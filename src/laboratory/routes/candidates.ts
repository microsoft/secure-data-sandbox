import { Router } from 'express';

import { Candidate } from '../models';

export const candidates = Router();

candidates.get('', async (req, res, next) => {
  try {
    res.json(await Candidate.findAll());
  } catch (e) {
    next(e);
  }
});

// TODO: investigate scope
//   res.json(await Candidate.scope(req.query['scope']).findAll());
//   May be useful for getting just names (instead of complete specs)

candidates.get('/:name', async (req, res, next) => {
  try {
    // TODO: does this even work? Is name the pk?
    const candidate = await Candidate.findByPk(req.params['name']);
    res.json(candidate);
  } catch (e) {
    next(e);
  }
});

// TODO: should we post to / in order to avoid name mismatch?
candidates.put('/:name', async (req, res, next) => {
  try {
    const spec = Candidate.validate(req.body, req.params['name']);

    await Candidate.upsert<Candidate>(spec);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});
