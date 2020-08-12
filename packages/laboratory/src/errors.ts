import * as express from 'express';

import { EntityNotFoundError, IllegalOperationError } from '@microsoft/sds';

export function setErrorStatus(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err instanceof EntityNotFoundError) {
    res.statusCode = 404;
  } else if (err instanceof IllegalOperationError) {
    res.statusCode = 400;
  }
  next(err);
}
