import { Router } from 'express';

import {
  ILaboratory,
  validateRunRequest,
  validateRunStatus,
  validateMeasures,
} from '../../logic';

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

  router.patch('/:name', async (req, res, next) => {
    try {
      // TODO: validate UpdateRunStatusRequestBody.
      // const status = validateRunStatus(req.body);
      const { status } = req.body;
      res.json(await lab.updateRunStatus(req.params['name'], status));
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const spec = validateRunRequest(req.body);
      const run = await lab.createRunRequest(spec);
      res.json(run);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/:name/results', async (req, res, next) => {
    try {
      // TODO: validate ReportRunResultsRequestBody.
      // const measures = validateMeasures(req.body);
      const { measures } = req.body;
      res.json(await lab.reportRunResults(req.params['name'], measures));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
