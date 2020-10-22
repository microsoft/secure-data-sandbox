// Verify that the samples are valid against the laboratory
import {
  IBenchmark,
  ICandidate,
  InMemoryQueue,
  IRunRequest,
  ISuite,
  PipelineRun,
} from '@microsoft/sds';
import * as chai from 'chai';
import { assert } from 'chai';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);

import * as fs from 'fs';
import * as yaml from 'js-yaml';

import { createApp } from '../src';
import { initTestEnvironment } from './sequelize_laboratory/shared';

describe('laboratory/samples', () => {
  it('runs catdetection', async () => {
    const queue = new InMemoryQueue<PipelineRun>();
    const lab = await initTestEnvironment(queue);
    const app = await createApp(lab);

    const benchmark = yaml.safeLoad(
      fs.readFileSync('../../samples/catdetection/benchmark.yml', 'utf8')
    ) as IBenchmark;
    let res = await chai
      .request(app)
      .put(`/benchmarks/${benchmark.name}`)
      .send(benchmark);
    assert.equal(res.status, 200);

    const suite = yaml.safeLoad(
      fs.readFileSync('../../samples/catdetection/suite.yml', 'utf8')
    ) as ISuite;
    res = await chai.request(app).put(`/suites/${suite.name}`).send(suite);
    assert.equal(res.status, 200);

    const candidate = yaml.safeLoad(
      fs.readFileSync('../../samples/catdetection/candidate.yml', 'utf8')
    ) as ICandidate;
    res = await chai
      .request(app)
      .put(`/candidates/${candidate.name}`)
      .send(candidate);
    assert.equal(res.status, 200);

    const runRequest: IRunRequest = {
      candidate: candidate.name,
      suite: suite.name,
    };
    res = await chai.request(app).post('/runs').send(runRequest);
    assert.equal(res.status, 202);

    const runs = await queue.dequeue(1);
    const run = runs[0].value;

    const expected: PipelineRun = {
      laboratoryEndpoint: 'http://localhost:3000',
      name: res.body.name,
      stages: [
        {
          name: 'prep',
          kind: 'container',
          image: 'acanthamoeba/sds-prep',
          env: {
            IMAGE_URL: 'https://placekitten.com/1024/768',
            BENCHMARK_AUTHOR: 'acanthamoeba',
          },
          volumes: [
            {
              name: 'images',
              type: 'ephemeral',
              source: undefined,
              target: '/out',
              readonly: false,
            },
          ],
        },
        {
          name: 'candidate',
          kind: 'candidate',
          image: 'acanthamoeba/sds-candidate',
          env: {
            API_KEY: '<your api key here>',
            SERVICE_ENDPOINT:
              'https://<your service>.cognitiveservices.azure.com/',
          },
          volumes: [
            {
              name: 'images',
              type: 'ephemeral',
              source: undefined,
              target: '/in',
              readonly: true,
            },
            {
              name: 'predictions',
              type: 'ephemeral',
              source: undefined,
              target: '/out',
              readonly: false,
            },
          ],
        },
        {
          name: 'eval',
          kind: 'container',
          image: 'acanthamoeba/sds-eval',
          env: {
            EXPECTED_ANIMAL: 'cat',
            CANDIDATE_IMAGE: 'acanthamoeba/sds-candidate',
          },
          cmd: ['/bin/sh', '/start.sh', run.name, 'http://localhost:3000'],
          volumes: [
            {
              name: 'predictions',
              type: 'ephemeral',
              source: undefined,
              target: '/results',
              readonly: true,
            },
            {
              name: 'scores',
              type: 'ephemeral',
              source: undefined,
              target: '/scores',
              readonly: false,
            },
          ],
        },
      ],
    };

    assert.deepEqual(run, expected);
  });
});
