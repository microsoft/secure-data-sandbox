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
} from '../laboratory';
import { lab } from '../../test/unit/laboratory/shared';

// global client
let client: LaboratoryClient | undefined;

const configDir = path.join(os.homedir(), '.sds');
const connFilePath = 'sds.yaml';
const tokenCachePath = 'accessTokens.json';

const cachePlugin = {
  async readFromStorage() {
    return readConfig(tokenCachePath);
  },
  async writeToStorage(getMergedState: (oldState: string) => string) {
    let oldFile = '';
    try {
      oldFile = await readConfig(tokenCachePath);
    } finally {
      const mergedState = getMergedState(oldFile);
      await writeConfig(tokenCachePath, mergedState);
    }
  },
};

export async function initConnection(host: string) {
  const labUrl = url.parse(host);
  const endpoint = labUrl.href;

  const connectionInfo = await new LaboratoryClient(
    endpoint
  ).negotiateConnection();
  const config: IConnectConfiguration = {
    endpoint,
    ...connectionInfo,
  };
  await writeConfig(connFilePath, yaml.safeDump(config));
  const newClient = buildClient(config);
  await newClient.validateConnection();
  client = newClient;
}

export async function getLabClient(): Promise<LaboratoryClient> {
  try {
    if (client) {
      return client;
    }

    const text = await readConfig(connFilePath);
    const config = validate(ConnectConfigurationType, yaml.safeLoad(text));
    client = buildClient(config);
    return client;
  } catch {
    throw new IllegalOperationError(
      'No laboratory connection. Use the "connect" command to specify a laboratory.'
    );
  }
}

// tslint:disable-next-line:variable-name
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

function acquireAADAccessToken(config: IConnectConfiguration) {
  if (config.type !== 'aad') {
    throw new Error(
      'Cannot retrieve an AAD access token for a non-AAD connection'
    );
  }

  return async () => {
    const pca = new msal.PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: config.authority,
      },
      cache: {
        cachePlugin,
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
      await writeConfig(connFilePath, yaml.safeDump(config));
      cache.writeToPersistence();
      return deviceCodeResult.accessToken;
    }
  };
}

function buildClient(config: IConnectConfiguration): LaboratoryClient {
  const tokenRetriever =
    config.type === 'aad' ? acquireAADAccessToken(config) : undefined;
  return new LaboratoryClient(config.endpoint, tokenRetriever);
}

async function readConfig(filePath: string): Promise<string> {
  const fullPath = path.join(configDir, filePath);
  try {
    return await fs.readFile(fullPath, 'utf8');
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return '';
    }

    throw e;
  }
}

async function writeConfig(filePath: string, data: string): Promise<void> {
  const fullPath = path.join(configDir, filePath);
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(fullPath, data);
}
