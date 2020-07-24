import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as errorhandler from 'strong-error-handler';

import { ILaboratory } from '../logic';

import { setErrorStatus } from './errors';

import {
  createBenchmarkRouter,
  createCandidateRouter,
  createRunRouter,
  createSuiteRouter,
} from './routes';

export async function createApp(lab: ILaboratory): Promise<express.Express> {
  const app = express();

  // middleware for parsing application/x-www-form-urlencoded
  // TODO: why is body-parser deprecated for this usage?
  // tslint:disable-next-line: deprecation
  app.use(bodyParser.urlencoded({ extended: true }));

  // middleware for json body parsing
  // TODO: why is body-parser deprecated for this usage?
  // TODO: review limit parameter
  app.use(
    // tslint:disable-next-line: deprecation
    bodyParser.json({
      // TODO: REVIEW: magic number 100kb
      limit: '100kb',
    })
  );

  app.use('/benchmarks', createBenchmarkRouter(lab));
  app.use('/candidates', createCandidateRouter(lab));
  app.use('/runs', createRunRouter(lab));
  app.use('/suites', createSuiteRouter(lab));

  // Set the response status code for errors like EntityNotFoundError
  // and IllegalOperationError.
  app.use(setErrorStatus);

  app.use(
    errorhandler({
      debug: process.env.ENV !== 'prod',
      log: true,
    })
  );

  return app;
}
