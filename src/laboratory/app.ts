import * as express from 'express';
import * as bodyParser from 'body-parser';
import { benchmarks } from './routes';
import * as errorhandler from 'strong-error-handler';

export const app = express();

// middleware for parsing application/x-www-form-urlencoded
// TODO: why is body-parser deprecated for this usage?
// tslint:disable-next-line: deprecation
app.use(bodyParser.urlencoded({ extended: true }));

// middleware for json body parsing
// TODO: why is body-parser deprecated for this usage?
// TODO: review limit parameter
// tslint:disable-next-line: deprecation
app.use(bodyParser.json({ limit: '100kb' }));

// enable corse for all origins
// TODO: review these declarations
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', 'x-total-count');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,authorization');

  next();
});

app.use('/benchmarks', benchmarks);

app.use(
  errorhandler({
    debug: process.env.ENV !== 'prod',
    log: true,
  })
);
