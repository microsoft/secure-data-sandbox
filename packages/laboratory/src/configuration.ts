import * as os from 'os';
import {
  QueueConfiguration,
  AzureSqlDatabaseConfiguration,
  DatabaseConfiguration,
  DatabaseMode,
} from '@microsoft/sds';
import {
  AzureCredential,
  ParseQueueConfiguration,
} from '@microsoft/sds/dist/configuration';

import * as env from 'env-var';

// import appInsights
import * as appInsights from 'applicationinsights';

export enum AuthMode {
  AAD = 'AAD',
  None = 'none',
}

export interface AuthConfiguration {
  mode: AuthMode;
}

export interface AADConfiguration extends AuthConfiguration {
  mode: AuthMode.AAD;
  tenantId: string;
  laboratoryClientId: string;
  cliClientId: string;
  scopes: string[];
}

export const NoAuthConfiguration = {
  mode: AuthMode.None,
};

export interface LaboratoryConfiguration {
  endpointBaseUrl: string;
  port: number;
  queue: QueueConfiguration;
  database: DatabaseConfiguration;
  auth: AuthConfiguration;
}

/**
 * Retrieve a DatabaseConfiguration from the current execution environment.
 */
export function ParseDatabaseConfiguration(): DatabaseConfiguration {
  const mode = env
    .get('SQL_MODE')
    .default(DatabaseMode.InMemory)
    .asEnum(Object.values(DatabaseMode)) as DatabaseMode;

  const host = env
    .get('SQL_HOST')
    .required(mode !== DatabaseMode.InMemory)
    .asString();

  switch (mode) {
    case DatabaseMode.AzureSql:
      return {
        mode,
        host,
        database: env.get('SQL_DB').required().asString(),
        credential: AzureCredential.getInstance(),
      } as AzureSqlDatabaseConfiguration;
    case DatabaseMode.InMemory:
      return {
        mode,
        host: 'localhost',
      };
  }
}

function ParseAuthConfiguration(): AuthConfiguration {
  const authMode = env.get('AUTH_MODE').asString();
  console.log(authMode);
  if (authMode === 'aad') {
    const tenantId = env.get('AUTH_TENANT_ID').required().asString();
    const laboratoryClientId = env
      .get('AUTH_LABORATORY_CLIENT_ID')
      .required()
      .asString();
    const cliClientId = env.get('AUTH_CLI_CLIENT_ID').required().asString();
    const scopes = env
      .get('AUTH_SCOPES')
      .default('laboratory')
      .asArray(' ')
      .map(s => `api://${laboratoryClientId}/${s}`);

    // offline_access is required to use refresh tokens
    scopes.push('offline_access');

    const config: AADConfiguration = {
      mode: AuthMode.AAD,
      tenantId,
      laboratoryClientId,
      cliClientId,
      scopes,
    };
    return config;
  } else {
    return NoAuthConfiguration;
  }
}

export function ParseLaboratoryConfiguration(): LaboratoryConfiguration {
  const port = env.get('PORT').default(3000).asPortNumber();

  let endpointBaseUrl = env.get('LABORATORY_ENDPOINT').asUrlString();

  // if endpoint is not explicitly specified, check for WEBSITE_HOSTNAME and assume HTTPS over 443
  // this variable gets autowired by Azure App Service
  if (!endpointBaseUrl) {
    const hostname = env.get('WEBSITE_HOSTNAME').asString();

    // if not found, fallback to machine hostname
    endpointBaseUrl = hostname
      ? `https://${hostname}`
      : `http://${os.hostname()}:${port}`;
  }

  // setup automated request & expection tracking (require APPINSIGHTS_INSTRUMENTATIONKEY to be declared in the environment)
  appInsights.setup();
  const key = appInsights.defaultClient.context.keys.cloudRole;
  appInsights.defaultClient.context.tags[key] = 'codespace_sds';
  appInsights.start();

  return {
    endpointBaseUrl,
    port,
    queue: ParseQueueConfiguration(),
    database: ParseDatabaseConfiguration(),
    auth: ParseAuthConfiguration(),
  };
}
