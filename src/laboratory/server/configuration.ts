import { QueueConfiguration } from '../../queue';
import { DatabaseConfiguration } from '../../database';

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

// tslint:disable-next-line:variable-name
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
