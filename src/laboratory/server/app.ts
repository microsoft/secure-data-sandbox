import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as errorhandler from 'strong-error-handler';

import { entityBaseReviver, ILaboratory } from '../logic';

import { createBenchmarkRouter, createCandidateRouter } from './routes';

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
      limit: '100kb',
      reviver: entityBaseReviver,
    })
  );

  // enable corse for all origins
  // TODO: review these declarations
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Expose-Headers', 'x-total-count');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,authorization');

    next();
  });

  app.use('/benchmarks', createBenchmarkRouter(lab));
  app.use('/candidates', createCandidateRouter(lab));

  app.use(
    errorhandler({
      debug: process.env.ENV !== 'prod',
      log: true,
    })
  );

  return app;
}
