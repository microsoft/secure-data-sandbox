require('express-async-errors');
import { Router } from 'express';

import {
  ILaboratory,
  ReportRunResultsType,
  RunRequestType,
  UpdateRunStatusType,
  validate,
  ValidationError,
} from '@microsoft/sds';

export function createRunRouter(lab: ILaboratory): Router {
  const router = Router();

  router
    .route('/runs')
    .get(async (req, res) => {
      res.json(await lab.allRuns());
    })
    .post(async (req, res) => {
      const runRequest = validate(RunRequestType, req.body);
      const run = await lab.createRunRequest(runRequest);
      res.status(202);
      res.json(run);
    });

  router.get('/runs/results', async (req, res) => {
    if (
      typeof req.query.benchmark !== 'string' ||
      typeof req.query.suite !== 'string'
    ) {
      throw new ValidationError(
        'Query parameters for `benchmark` and `suite` must be provided'
      );
    }

    res.json(
      await lab.allRunResults(req.query['benchmark'], req.query['suite'])
    );
  });

  router
    .route('/runs/:name')
    .get(async (req, res) => {
      res.json(await lab.oneRun(req.params['name']));
    })
    .patch(async (req, res) => {
      const { status } = validate(UpdateRunStatusType, req.body);
      await lab.updateRunStatus(req.params['name'], status);
      res.status(204);
      res.end();
    });

  router.post('/runs/:name/results', async (req, res) => {
    const { measures } = validate(ReportRunResultsType, req.body);
    await lab.reportRunResults(req.params['name'], measures);
    res.status(204);
    res.end();
  });

  return router;
}
