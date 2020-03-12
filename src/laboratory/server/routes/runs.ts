import { Router } from 'express';

import {
  ILaboratory,
  ReportRunResultsType,
  RunRequestType,
  UpdateRunStatusType,
  validate,
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
      const { status } = validate(UpdateRunStatusType, req.body);
      res.json(await lab.updateRunStatus(req.params['name'], status));
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const runRequest = validate(RunRequestType, req.body);
      const run = await lab.createRunRequest(runRequest);
      res.json(run);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/:name/results', async (req, res, next) => {
    try {
      const { measures } = validate(ReportRunResultsType, req.body);
      res.json(await lab.reportRunResults(req.params['name'], measures));
    } catch (e) {
      next(e);
    }
  });

  router.get('/:benchmark/:suite', async (req, res, next) => {
    try {
      res.json(
        await lab.allRunResults(req.params['benchmark'], req.params['suite'])
      );
    } catch (e) {
      next(e);
    }
  });

  return router;
}
