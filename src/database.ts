import { Sequelize } from 'sequelize-typescript';
import { ConnectionConfig } from 'tedious';
import { TokenCredential } from '@azure/identity';

export enum DatabaseMode {
  AzureSql = 'azuresql',
  InMemory = 'inmemory',
}

export interface DatabaseConfiguration {
  mode: DatabaseMode;
  host: string;
}

export interface AzureSqlDatabaseConfiguration extends DatabaseConfiguration {
  mode: DatabaseMode.AzureSql;
  database: string;
  credential: TokenCredential;
}

export function GetSequelize(config: DatabaseConfiguration): Sequelize {
  // tsc ensures that all elements of the discriminated union are covered: https://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking
  // The following is safe but tslint doesn't understand, so we suppress the rule: https://github.com/palantir/tslint/issues/2104
  // tslint:disable:switch-default
  switch (config.mode) {
    case DatabaseMode.AzureSql:
      const azureConfig = config as AzureSqlDatabaseConfiguration;
      return new Sequelize({
        database: azureConfig.database,
        dialect: 'mssql',
        dialectOptions: {
          options: {
            encrypt: true,
          },
        },
        hooks: {
          beforeConnect: async config => {
            const tediousConfig = config.dialectOptions as ConnectionConfig;
            const accessToken = await azureConfig.credential.getToken(
              'https://database.windows.net/'
            );
            Object.assign(tediousConfig, {
              authentication: {
                type: 'azure-active-directory-access-token',
                options: {
                  token: accessToken?.token,
                },
              },
            });
          },
        },
        host: azureConfig.host,
        retry: {
          max: 3,
        },
      });
    case DatabaseMode.InMemory:
      return new Sequelize('sqlite::memory:');
  }
}
