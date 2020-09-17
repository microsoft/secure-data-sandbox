import * as msal from '@azure/msal-node';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import * as t from 'io-ts';
import * as url from 'url';

import {
  IllegalOperationError,
  LaboratoryClient,
  validate,
  ClientConnectionInfoType,
} from '@microsoft/sds';

const defaultConnFilePath = 'sds.yaml';

const ConnectConfigurationType = t.intersection([
  t.type({
    endpoint: t.string,
  }),
  ClientConnectionInfoType,
  t.partial({
    // from msal-common/AccountInfo
    account: t.type({
      homeAccountId: t.string,
      environment: t.string,
      tenantId: t.string,
      username: t.string,
    }),
  }),
]);
type IConnectConfiguration = t.TypeOf<typeof ConnectConfigurationType>;

export class LaboratoryConnection {
  static configDir: string = path.join(os.homedir(), '.sds');

  private client: LaboratoryClient | undefined;

  connFilePath: string;
  tokenCachePath: string;

  constructor(connFilePath: string = defaultConnFilePath) {
    this.connFilePath = connFilePath;
    this.tokenCachePath = `${path.basename(connFilePath)}-accessTokens.json`;
  }

  async init(host: string) {
    const labUrl = new url.URL(host);
    const endpoint = labUrl.href;

    const connectionInfo = await new LaboratoryClient(
      endpoint
    ).negotiateConnection();
    const config: IConnectConfiguration = {
      endpoint,
      ...connectionInfo,
    };
    await this.writeConfig(yaml.safeDump(config));
    const newClient = this.buildClient(config);
    await newClient.validateConnection();
    this.client = newClient;
  }

  async getClient(): Promise<LaboratoryClient> {
    try {
      if (this.client) {
        return this.client;
      }

      const text = await this.readConfig();
      const config = validate(ConnectConfigurationType, yaml.safeLoad(text));
      this.client = this.buildClient(config);
      return this.client;
    } catch {
      throw new IllegalOperationError(
        'No laboratory connection. Use the "connect" command to specify a laboratory.'
      );
    }
  }

  private buildClient(config: IConnectConfiguration): LaboratoryClient {
    const tokenRetriever =
      config.type === 'aad' ? this.acquireAADAccessToken(config) : undefined;
    return new LaboratoryClient(config.endpoint, tokenRetriever);
  }

  private async readConfig(): Promise<string> {
    const fullPath = path.join(
      LaboratoryConnection.configDir,
      this.connFilePath
    );
    return await fs.readFile(fullPath, 'utf8');
  }

  private async writeConfig(data: string): Promise<void> {
    const fullPath = path.join(
      LaboratoryConnection.configDir,
      this.connFilePath
    );
    await fs.mkdir(LaboratoryConnection.configDir, { recursive: true });
    await fs.writeFile(fullPath, data);
  }

  private acquireAADAccessToken(config: IConnectConfiguration) {
    if (config.type !== 'aad') {
      throw new Error(
        'Cannot retrieve an AAD access token for a non-AAD connection'
      );
    }

    return async () => {
      const tokenCachePath = this.tokenCachePath;
      const pca = new msal.PublicClientApplication({
        auth: {
          clientId: config.clientId,
          authority: config.authority,
        },
        cache: {
          cachePlugin: {
            async readFromStorage() {
              const fullPath = path.join(
                LaboratoryConnection.configDir,
                tokenCachePath
              );
              return await fs.readFile(fullPath, 'utf8');
            },
            async writeToStorage(getMergedState: (oldState: string) => string) {
              let oldFile = '';
              try {
                oldFile = await this.readFromStorage();
              } finally {
                const mergedState = getMergedState(oldFile);
                const fullPath = path.join(
                  LaboratoryConnection.configDir,
                  tokenCachePath
                );
                await fs.mkdir(LaboratoryConnection.configDir, {
                  recursive: true,
                });
                await fs.writeFile(fullPath, mergedState);
              }
            },
          },
        },
      });
      const cache = pca.getTokenCache();

      try {
        await cache.readFromPersistence();
        const silentResult = await pca.acquireTokenSilent({
          account: config.account!,
          scopes: config.scopes,
        });
        cache.writeToPersistence();
        return silentResult.accessToken;
      } catch (e) {
        const deviceCodeResult = await pca.acquireTokenByDeviceCode({
          deviceCodeCallback: response => console.log(response.message),
          scopes: config.scopes,
        });
        config.account = deviceCodeResult.account;
        await this.writeConfig(yaml.safeDump(config));
        cache.writeToPersistence();
        return deviceCodeResult.accessToken;
      }
    };
  }
}
