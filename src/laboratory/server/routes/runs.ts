require('express-async-errors');
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

  router
    .route('/runs')
    .get(async (req, res) => {
      if (
        typeof req.query.benchmark === 'string' &&
        typeof req.query.suite === 'string'
      ) {
        res.json(
          await lab.allRunResults(req.query['benchmark'], req.query['suite'])
        );
      } else {
        res.json(await lab.allRuns());
      }
    })
    .post(async (req, res) => {
      const runRequest = validate(RunRequestType, req.body);
      const run = await lab.createRunRequest(runRequest);
      res.json(run);
    });

  router
    .route('/runs/:name')
    .get(async (req, res) => {
      res.json(await lab.oneRun(req.params['name']));
    })
    .patch(async (req, res) => {
      const { status } = validate(UpdateRunStatusType, req.body);
      res.json(await lab.updateRunStatus(req.params['name'], status));
    });

  router.post('/runs/:name/results', async (req, res) => {
    const { measures } = validate(ReportRunResultsType, req.body);
    res.json(await lab.reportRunResults(req.params['name'], measures));
  });

  return router;
}
