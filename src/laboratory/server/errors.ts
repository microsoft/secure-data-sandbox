import * as express from 'express';

import {
  EntityNotFoundError,
  IllegalOperationError,
} from '../logic/interfaces';

export function setErrorStatus(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // console.log(`xxx translateError(${err.message})`);
  if (err instanceof EntityNotFoundError) {
    // console.log('res.statusCode = 404;');
    res.statusCode = 404;
  } else if (err instanceof IllegalOperationError) {
    // console.log('res.statusCode = 400;');
    res.statusCode = 400;
  }
  // console.log('next(err)');
  next(err);
}
