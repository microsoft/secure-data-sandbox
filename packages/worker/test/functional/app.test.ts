import { assert } from 'chai';
import * as Dockerode from 'dockerode';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { v1 } from 'uuid';
import { PipelineRun } from '@microsoft/sds';
import { PipelineWorker } from '../../src/pipelineWorker';
import * as configuration from '../../../sds/test/functional/configuration';

describe('functional.worker', () => {
  const { queue } = configuration.getQueueConfiguration<PipelineRun>();
  let docker: Dockerode;
  let worker: PipelineWorker;

  before(async () => {
    docker = new Dockerode();
    await docker.pull('alpine', {});

    worker = new PipelineWorker(queue, docker);
  });

  afterEach(() => {
    worker.stop();
    sinon.restore();
  });

  it('executesSingleContainer', async () => {
    const createContainer = sinon.spy(docker, 'createContainer');

    const runId = v1();
    await queue.enqueue({
      name: runId,
      statusEndpoint: `http://localhost:3000/runs/${runId}`,
      resultsEndpoint: `http://localhost/runs/${runId}/results`,
      stages: [
        {
          name: 'test',
          image: 'alpine',
          cmd: ['/bin/sh', '-c', 'echo hello, world'],
        },
      ],
    });

    worker.start();
    await waitUntil(() => createContainer.calledOnce);
  });

  it('deletesContainerAfterSuccessfulRun', async () => {
    const createContainer = sinon.spy(docker, 'createContainer');

    const runId = v1();
    await queue.enqueue({
      name: runId,
      statusEndpoint: `http://localhost:3000/runs/${runId}`,
      resultsEndpoint: `http://localhost/runs/${runId}/results`,
      stages: [
        {
          name: 'test',
          image: 'alpine',
          cmd: ['/bin/sh', '-c', 'echo hello, world'],
        },
      ],
    });

    worker.start();
    await waitUntil(() => createContainer.calledOnce);

    const container = await createContainer.firstCall.returnValue;
    const removeContainer = sinon.spy(container, 'remove');
    await waitUntil(() => removeContainer.calledOnce);
  });

  it('executesMultipleContainersWithVolumes', async () => {
    const createContainer = sinon.spy(docker, 'createContainer');

    const volumeBasePath = configuration.getDockerBaseVolumePath();
    const runId = v1();
    const basePath = `${volumeBasePath}${runId}`;

    fs.mkdirSync(`${basePath}/input`, { recursive: true });
    fs.mkdirSync(`${basePath}/candidateOutput`);
    fs.mkdirSync(`${basePath}/scoredResults`);

    fs.closeSync(fs.openSync(`${basePath}/input/file1.txt`, 'w'));
    fs.closeSync(fs.openSync(`${basePath}/input/file2.txt`, 'w'));
    fs.closeSync(fs.openSync(`${basePath}/input/file3.txt`, 'w'));

    await queue.enqueue({
      name: runId,
      statusEndpoint: `http://localhost:3000/runs/${runId}`,
      resultsEndpoint: `http://localhost/runs/${runId}/results`,
      stages: [
        // Simulate a candidate that simply lists files from the input directory
        {
          name: 'candidate',
          image: 'alpine',
          cmd: ['/bin/sh', '-c', '--', `ls /input > /results/${runId}.txt`],
          volumes: [
            {
              type: 'LocalFile',
              target: '/input',
              source: `${basePath}/input`,
              readonly: true,
            },
            {
              type: 'LocalFile',
              target: '/results',
              source: `${basePath}/candidateOutput`,
              readonly: false,
            },
          ],
        },
        // Simulate a scoring program that runs a word count of the results from the candidate
        {
          name: 'scoring',
          image: 'alpine',
          cmd: [
            '/bin/sh',
            '-c',
            '--',
            `wc -l /input/${runId}.txt > /results/${runId}.txt`,
          ],
          volumes: [
            {
              type: 'LocalFile',
              target: '/input',
              source: `${basePath}/candidateOutput`,
              readonly: true,
            },
            {
              type: 'LocalFile',
              target: '/results',
              source: `${basePath}/scoredResults`,
              readonly: false,
            },
          ],
        },
      ],
    });

    worker.start();
    await waitUntil(() => createContainer.calledTwice);

    const container = await createContainer.secondCall.returnValue;
    const removeContainer = sinon.spy(container, 'remove');
    await waitUntil(() => removeContainer.calledOnce);

    const scoredOutput = fs.readFileSync(
      `${basePath}/scoredResults/${runId}.txt`,
      'utf8'
    );
    assert.equal(scoredOutput, `3 /input/${runId}.txt\n`);
  });

  async function waitUntil(
    condition: () => boolean,
    tick = 100,
    timeout = 1000
  ) {
    const maxTime = Date.now() + timeout;
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (Date.now() > maxTime) {
          throw new Error('Timed out');
        }

        if (condition()) {
          resolve();
          clearInterval(interval);
        }
      }, tick);
    });
  }
});
