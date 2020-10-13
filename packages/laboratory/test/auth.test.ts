import * as chai from 'chai';
import { assert } from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);

import { Express } from 'express';

import { initTestEnvironment } from './sequelize_laboratory/shared';
import { createApp } from '../src';
import { AuthMode, AADConfiguration } from '../src/configuration';
import {
  benchmark1,
  candidate1,
  run1,
  suite1,
} from '../../sds/test/laboratory/data';

const tenantId = '14e838c1-762c-45f0-8d29-72adfd6ee5cf';
const laboratoryClientId = '69f79aed-396b-4d23-b306-591e32ea3a6a';
const cliClientId = 'd4414747-f372-494a-85ff-41c49736a6cc';
const allowedApplicationClientId = '3b0f4ee2-db94-4125-9d4d-fb24d77af4f6';

const noRolesToken =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiI2OWY3OWFlZC0zOTZiLTRkMjMtYjMwNi01OTFlMzJlYTNhNmEiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMTRlODM4YzEtNzYyYy00NWYwLThkMjktNzJhZGZkNmVlNWNmL3YyLjAiLCJpYXQiOjE2MDIyMDE3MTcsIm5iZiI6MTYwMjIwMTcxNywiZXhwIjoxNjAyMjA1NjE3LCJhaW8iOiJFMlJnWVBqRVlPbjZTL3FabnZTTXhMMVBqVVNDQUE9PSIsImF6cCI6IjNiMGY0ZWUyLWRiOTQtNDEyNS05ZDRkLWZiMjRkNzdhZjRmNiIsImF6cGFjciI6IjEiLCJvaWQiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJyaCI6IjAuQUFBQXdUam9GQ3gyOEVXTktYS3RfVzdsei1KT0R6dVUyeVZCblUzN0pOZDY5UFp2QUFBLiIsInN1YiI6IjM4YzkxZDczLTJhMWItNDQ2OS04ZTg1LTE1MDNlMjRkMTE5NiIsInRpZCI6IjE0ZTgzOGMxLTc2MmMtNDVmMC04ZDI5LTcyYWRmZDZlZTVjZiIsInV0aSI6InY5THF3ajJHeEV1cGYzMk5DOW5hQVEiLCJ2ZXIiOiIyLjAifQ.QKv0fGHsDBQOhRTIr6-yLmaccY2TVrMWU6gM_PdNrWQ6_VrQ_fN0IxQYaCDjypCzmezfkob9fJ4gP-A5Vk3XdyiGG90txi50H5qG-f6XmhGMFNSYMcqsbb_yugysy_Nl1x4nXMx_kzqwZJw9U0RB0OIU5--uclSa7SUrM2ThFyTJ0W5XOjEA85tRQelREAesjcio71E03DvhyyQfUbCY3jiIt8pktmzPws6xIn8Gj1IlfQCF_t1zntAcFTB5lGThEAmmlnV-QmmixJ84FNSlYVJMbqQwoLbk9OkrFqdG-bz95RT0W5PAA-DvX2ygMvc__RdGGO3FXyvOBYzH5y77sQ';
const userToken =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiI2OWY3OWFlZC0zOTZiLTRkMjMtYjMwNi01OTFlMzJlYTNhNmEiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMTRlODM4YzEtNzYyYy00NWYwLThkMjktNzJhZGZkNmVlNWNmL3YyLjAiLCJpYXQiOjE2MDIyMDc4NjksIm5iZiI6MTYwMjIwNzg2OSwiZXhwIjoxNjAyMjExNzY5LCJhaW8iOiJFMlJnWUxqaXg1Y2FxTGYzYUJuMzRuNXZUdm0zQUE9PSIsImF6cCI6IjNiMGY0ZWUyLWRiOTQtNDEyNS05ZDRkLWZiMjRkNzdhZjRmNiIsImF6cGFjciI6IjEiLCJvaWQiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJyaCI6IjAuQUFBQXdUam9GQ3gyOEVXTktYS3RfVzdsei1KT0R6dVUyeVZCblUzN0pOZDY5UFp2QUFBLiIsInJvbGVzIjpbInVzZXIiXSwic3ViIjoiMzhjOTFkNzMtMmExYi00NDY5LThlODUtMTUwM2UyNGQxMTk2IiwidGlkIjoiMTRlODM4YzEtNzYyYy00NWYwLThkMjktNzJhZGZkNmVlNWNmIiwidXRpIjoiczdEM0VZQnd3VTJlN3U5YloxUUFBQSIsInZlciI6IjIuMCJ9.Wb49rw15hGeFTQVVJGEZZ0Z0RyuIFOem9wMqiN5fOIOlNTtB_2z_ZPvfiyLUdprmZFYmv4jHQfjVQgelicZimmOKOgAai6_qHKql78W_wd1xJAi20cd_6rJaQF1YgSvU6fWH5JaQI0GO3hqGOX3TauhA5mtLqO4j9nPoDKGObOJoiIzg5KntBXzTybHUirWkeiQbuIahqTYik4LLes1zKs2t5HZoFDBGRfwnKlZ5ff-kIbrEnDLA6kCD_j4TQ-IelLv-075ruWKrdEJvVmvsQ3L1i0cY31wQ_J7XM3Ws0dnb7YVvY3enNEBj4YssCoy3cpFnl48uS5K0JenzSMDyZA';
const adminToken =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiI2OWY3OWFlZC0zOTZiLTRkMjMtYjMwNi01OTFlMzJlYTNhNmEiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMTRlODM4YzEtNzYyYy00NWYwLThkMjktNzJhZGZkNmVlNWNmL3YyLjAiLCJpYXQiOjE2MDIyMDc5NDUsIm5iZiI6MTYwMjIwNzk0NSwiZXhwIjoxNjAyMjExODQ1LCJhaW8iOiJFMlJnWUhqM1hPMkpRUGFPelVYejdoV25XdjFRQndBPSIsImF6cCI6IjNiMGY0ZWUyLWRiOTQtNDEyNS05ZDRkLWZiMjRkNzdhZjRmNiIsImF6cGFjciI6IjEiLCJvaWQiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJyaCI6IjAuQUFBQXdUam9GQ3gyOEVXTktYS3RfVzdsei1KT0R6dVUyeVZCblUzN0pOZDY5UFp2QUFBLiIsInJvbGVzIjpbImFkbWluIiwidXNlciJdLCJzdWIiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJ0aWQiOiIxNGU4MzhjMS03NjJjLTQ1ZjAtOGQyOS03MmFkZmQ2ZWU1Y2YiLCJ1dGkiOiJoNFdudWx4cjZFMkg1UFFwYzhZTEFBIiwidmVyIjoiMi4wIn0.vr_Od5EI8U-yAoVXrnlRbTisCPAFrZvSt-impaA4ZQWrw2iSKwjJffuN-OaZtgs8kKBqOmYCvV-in6mq9YXyKegBO50Rky9Rmo6IUV7iBDfOT4vpp2TxRiWXzHgkxiO7WUkQ72KxboNJlpj6CaCbWVD_oRcEubnHr-erjQo27PB83xDi3Bmrs0KctM3O1GveLj7tR13MgouIBc8wrIhL9r3C-3df8jC16OPz-25x_hqCj_ytGdDsS4nN3lc5Q-SsBriMd0OmMC8VIb01KnDZi6Mc35ra0RClo2OZFS8pghYpGK99LHiG6dIn_yxEjxL3lBU3JwgFumTf9utv71eZiw';
const benchmarkToken =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiI2OWY3OWFlZC0zOTZiLTRkMjMtYjMwNi01OTFlMzJlYTNhNmEiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMTRlODM4YzEtNzYyYy00NWYwLThkMjktNzJhZGZkNmVlNWNmL3YyLjAiLCJpYXQiOjE2MDIyMDgwODUsIm5iZiI6MTYwMjIwODA4NSwiZXhwIjoxNjAyMjExOTg1LCJhaW8iOiJFMlJnWUhENkdMTWlUMk4vdGt5WTVVeWJhSTA2QUE9PSIsImF6cCI6IjNiMGY0ZWUyLWRiOTQtNDEyNS05ZDRkLWZiMjRkNzdhZjRmNiIsImF6cGFjciI6IjEiLCJvaWQiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJyaCI6IjAuQUFBQXdUam9GQ3gyOEVXTktYS3RfVzdsei1KT0R6dVUyeVZCblUzN0pOZDY5UFp2QUFBLiIsInJvbGVzIjpbImJlbmNobWFyayJdLCJzdWIiOiIzOGM5MWQ3My0yYTFiLTQ0NjktOGU4NS0xNTAzZTI0ZDExOTYiLCJ0aWQiOiIxNGU4MzhjMS03NjJjLTQ1ZjAtOGQyOS03MmFkZmQ2ZWU1Y2YiLCJ1dGkiOiJtZm9ZRUlHcVBFMk5pS010cUY4TEFBIiwidmVyIjoiMi4wIn0.i_e_QC-HKyn2u2m4MJlCOPZOmDyA5hAdAcOJS9qgJITsRc93WAhBJ6Pfm24w2lbsO3fPfvTeTt3OUVuN5Npc-USyR95XBv2xcGyvoaM7USnqIwFFVHM9-FOg5pObDjNzJYjF6tZkK7lIQ81TYo-2F7NCFN3TaMAtMbCZyw7no0NtKRPr91pXKraFFsLS6IlWc2jWDHwPA-FnJ75MPwtQlg6-2aeW5T75oOikhxdYxFR7l7iy7z9EOjMDCy3-m-L4xUlzIQMSBsRyrKzcoqYlCfkJV5qWlgzu0V5fOWKoVaj8XbPQhv7ehsjQoeGLn59X_JumUMX9eHPmhPu06GJgsg';

const routes = {
  get: [
    '/connect/validate',
    '/benchmarks',
    `/benchmarks/${benchmark1.name}`,
    '/candidates',
    `/candidates/${candidate1.name}`,
    '/suites',
    `/suites/${suite1.name}`,
    '/runs',
    `/runs/${run1.name}`,
    '/runs/results',
  ],
  patch: [
    {
      path: `/runs/${run1.name}`,
      data: {
        status: 'completed',
      },
    },
  ],
  put: [
    {
      path: `/benchmarks/${benchmark1.name}`,
      data: benchmark1,
    },
    {
      path: `/candidates/${candidate1.name}`,
      data: candidate1,
    },
    {
      path: `/suites/${suite1.name}`,
      data: suite1,
    },
  ],
  post: [
    {
      path: '/runs',
      data: run1,
    },
    {
      path: `/runs/${run1.name}/results`,
      data: {
        measures: {
          metric1: 10,
          metric2: 20,
        },
      },
    },
  ],
};

describe('laboratory/auth', () => {
  // Minimal tests for AuthMode.None; it's not our target scenario
  describe('authMode: none', () => {
    it('allows anonymous users', async () => {
      const lab = await initTestEnvironment();
      const server = await createApp(lab, {
        mode: AuthMode.None,
      });

      chai
        .request(server)
        .get('/benchmarks')
        .end((_, res) => {
          assert.equal(res.status, 200);
        });
    });
  });

  describe('authMode: aad', () => {
    let server: Express;
    let runName: string;

    before(async () => {
      const lab = await initTestEnvironment();
      const config: AADConfiguration = {
        mode: AuthMode.AAD,
        tenantId: '14e838c1-762c-45f0-8d29-72adfd6ee5cf',
        laboratoryClientId: '69f79aed-396b-4d23-b306-591e32ea3a6a',
        cliClientId: 'd4414747-f372-494a-85ff-41c49736a6cc',
        scopes: [],
        allowedApplicationClientIds: [],
        ignoreExpiration: true,
      };
      server = await createApp(lab, config);

      await lab.upsertBenchmark(benchmark1);
      await lab.upsertSuite(suite1);
      await lab.upsertCandidate(candidate1);
      const run = await lab.createRunRequest({
        candidate: run1.candidate.name,
        suite: run1.suite.name,
      });
      runName = run.name;
    });

    it('enables the /connect endpoint', async () => {
      const res = await chai.request(server).get('/connect');
      assert.equal(res.status, 200);
    });

    it('rejects anonymous users', async () => {
      for (const r of routes.get) {
        const res = await chai.request(server).get(r);
        assert.equal(res.status, 401);
      }

      for (const r of routes.patch) {
        const res = await chai.request(server).patch(r.path).send(r.data);
        assert.equal(res.status, 401);
      }

      for (const r of routes.post) {
        const res = await chai.request(server).post(r.path).send(r.data);
        assert.equal(res.status, 401);
      }

      for (const r of routes.put) {
        const res = await chai.request(server).put(r.path).send(r.data);
        assert.equal(res.status, 401);
      }
    });

    it('rejects authenticated users without roles', async () => {
      const res = await chai
        .request(server)
        .get('/benchmarks')
        .set('Authorization', noRolesToken);
      assert.equal(res.status, 403);
    });

    it('allows user role to access the laboratory', async () => {
      const res = await chai
        .request(server)
        .get('/benchmarks')
        .set('Authorization', userToken);
      assert.notEqual(res.status, 403);
    });

    it('blocks user role from using admin endpoints', async () => {
      const res = await chai
        .request(server)
        .put(`/benchmarks/${benchmark1.name}`)
        .send(benchmark1)
        .set('Authorization', userToken);
      assert.equal(res.status, 403);
    });

    it('blocks user role from accessing system endpoints', async () => {
      const res = await chai
        .request(server)
        .patch(`/runs/${runName}`)
        .send({ status: 'completed' })
        .set('Authorization', userToken);
      assert.equal(res.status, 403);
    });

    it('allows admin role to use admin endpoints', async () => {
      const res = await chai
        .request(server)
        .put(`/benchmarks/${benchmark1.name}`)
        .send(benchmark1)
        .set('Authorization', adminToken);
      assert.notEqual(res.status, 403);
    });

    it('allows benchmark role to access system endpoints', async () => {
      const res = await chai
        .request(server)
        .patch(`/runs/${runName}`)
        .send({ status: 'completed' })
        .set('Authorization', benchmarkToken);
      assert.notEqual(res.status, 403);
    });

    it('allows preconfigured clients to call all endpoints', async () => {
      const lab = await initTestEnvironment();
      const config: AADConfiguration = {
        mode: AuthMode.AAD,
        tenantId,
        laboratoryClientId,
        cliClientId,
        scopes: [],
        allowedApplicationClientIds: [allowedApplicationClientId],
        ignoreExpiration: true,
      };
      const customServer = await createApp(lab, config);

      const res = await chai
        .request(customServer)
        .put(`/benchmarks/${benchmark1.name}`)
        .send(benchmark1)
        .set('Authorization', adminToken);
      assert.notEqual(res.status, 403);
    });
  });
});
