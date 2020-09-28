import * as chai from 'chai';
import chaiAsPromised = require('chai-as-promised');
import 'mocha';
import { assert } from 'chai';

import * as fs from 'fs';
import { Server } from 'http';
import * as path from 'path';
import { v1 } from 'uuid';

import { LaboratoryConnection } from '../src/conn';
import { initTestEnvironment } from '../../laboratory/test/sequelize_laboratory/shared';
import { createApp } from '../../laboratory/src';

chai.use(chaiAsPromised);

describe('LaboratoryConnection', () => {
  const connFilePath = `test-${v1()}.yaml`;
  let server: Server;

  before(async () => {
    const lab = await initTestEnvironment();
    const app = await createApp(lab);
    server = app.listen(3001);
  });

  describe('getClient', () => {
    it('fails when no connection is present', () => {
      const conn = new LaboratoryConnection(connFilePath);
      assert.isRejected(conn.getClient());
    });
  });

  describe('init', () => {
    it('fails when laboratory is not available', async () => {
      const conn = new LaboratoryConnection(connFilePath);
      assert.isRejected(conn.init('http://localhost:65535'));
    });

    it('succeeds against an unauthenticated laboratory', async () => {
      const conn = new LaboratoryConnection(connFilePath);
      await conn.init('http://localhost:3001');
    });
  });

  describe('getLabClient', () => {
    it('gets a client', async () => {
      const conn = new LaboratoryConnection(connFilePath);
      const client = await conn.getClient();
      assert.isNotNull(client);
    });

    it('returns a cached client', async () => {
      const conn = new LaboratoryConnection(connFilePath);
      const client = await conn.getClient();
      const client2 = await conn.getClient();
      assert.equal(client2, client);
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
    const connFileAbsPath = path.join(
      LaboratoryConnection.configDir,
      connFilePath
    );
    if (fs.existsSync(connFileAbsPath)) {
      fs.unlinkSync(connFileAbsPath);
    }
  });
});
