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
  const app = express()
    .use(express.json())

    // Set up application routes
    .use(createBenchmarkRouter(lab))
    .use(createCandidateRouter(lab))
    .use(createRunRouter(lab))
    .use(createSuiteRouter(lab))

    // Handle known errors
    .use(setErrorStatus)

    // Hide details in error messages
    .use(
      errorhandler({
        debug: process.env.NODE_ENV === 'development',
        negotiateContentType: false,
      })
    );

  return app;
}
