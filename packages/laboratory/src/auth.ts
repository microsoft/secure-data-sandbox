import { ForbiddenError } from '@microsoft/sds';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ITokenPayload } from 'passport-azure-ad';

import { AuthConfiguration, AuthMode, AADConfiguration } from './configuration';

export enum Role {
  User = 'user',
  Admin = 'admin',
  Benchmark = 'benchmark',
}

export function requireRole(
  role: Role,
  config: AuthConfiguration
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow request if auth is not enabled
    if (config.mode === AuthMode.None) {
      next();
    } else if (config.mode === AuthMode.AAD) {
      const user = req.user as ITokenPayload;
      const aadConfig = config as AADConfiguration;

      let authorized = false;

      // Allow request if the application is on the explicit application allow list
      if (
        user.azp &&
        aadConfig.allowedApplicationClientIds.includes(user.azp)
      ) {
        authorized = true;
      }

      if (
        user.roles?.includes(Role.Admin) ||
        user.roles?.includes(Role.Benchmark) ||
        user.roles?.includes(role)
      ) {
        authorized = true;
      }

      if (!authorized) {
        throw new ForbiddenError(
          `Caller does not have the required role: ${role}`
        );
      }

      next();
    } else {
      throw new Error(`Auth mode ${config.mode} not implemented`);
    }
  };
}
