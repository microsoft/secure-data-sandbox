import { SequelizeOptions } from 'sequelize-typescript';
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

export function GetSequelizeOptions(
  config: DatabaseConfiguration
): SequelizeOptions {
  switch (config.mode) {
    case DatabaseMode.AzureSql:
      // eslint-disable-next-line no-case-declarations
      const azureConfig = config as AzureSqlDatabaseConfiguration;
      return {
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
              'https://database.windows.net//.default'
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
      };
    case DatabaseMode.InMemory:
      return {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      };
  }
}
