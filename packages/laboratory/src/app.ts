import * as express from 'express';
import * as errorhandler from 'strong-error-handler';
import * as passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';

import { IClientConnectionInfo, ILaboratory } from '@microsoft/sds';
import { setErrorStatus } from './errors';
import {
  createBenchmarkRouter,
  createCandidateRouter,
  createRunRouter,
  createSuiteRouter,
} from './routes';

import {
  AuthConfiguration,
  AADConfiguration,
  AuthMode,
  NoAuthConfiguration,
} from './configuration';

function configureAADAuth(app: express.Express, config: AADConfiguration) {
  passport.use(
    new BearerStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${config.tenantId}/v2.0/.well-known/openid-configuration`,
        clientID: config.laboratoryClientId,
      },
      (token, done) => {
        return done(null, token);
      }
    )
  );

  // unauthenticated endpoint for clients to retrieve connection info
  app
    .get('/connect', (req, res) => {
      const connectionInfo: IClientConnectionInfo = {
        type: 'aad',
        clientId: config.cliClientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        scopes: config.scopes,
      };
      res.json(connectionInfo);
    })

    // require all endpoints to be authenticated
    .use(passport.initialize())
    .all('*', passport.authenticate('oauth-bearer', { session: false }));
}

export async function createApp(
  lab: ILaboratory,
  auth: AuthConfiguration = NoAuthConfiguration
): Promise<express.Express> {
  const app = express().use(express.json());

  // configure authorization
  switch (auth.mode) {
    case AuthMode.AAD:
      configureAADAuth(app, auth as AADConfiguration);
      break;
    case AuthMode.None:
    default:
      app.get('/connect', (req, res) => {
        const connectionInfo: IClientConnectionInfo = {
          type: 'unauthenticated',
        };
        res.json(connectionInfo);
      });
      break;
  }

  // Set up application routes
  app
    .get('/connect/validate', (req, res) => {
      res.status(200).end();
    })
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
