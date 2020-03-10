///////////////////////////////////////////////////////////////////////////////
//
// Data for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import { URL } from 'url';

import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  IRun,
  ISuite,
  RunStatus,
} from '../../../../src';

export const serviceURL = 'http://localhost:3000'; // TODO: plumb real url.
export const blobBase = 'http://blobs';

export const pipelines: IPipeline[] = [
  {
    mode: 'mode1',
    stages: [
      {
        // Candidate
      },
      {
        // Benchmark
        image: 'benchmark-image-mode1',
      },
    ],
  },
];

export const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: apiVersion,
  pipelines,
};

export const benchmark2: IBenchmark = {
  name: 'benchmark2',
  author: 'author2',
  version: apiVersion,
  pipelines,
};

export const benchmark3: IBenchmark = {
  name: 'benchmark3',
  author: 'author3',
  version: apiVersion,
  pipelines,
};

export const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate1-image',
};

export const candidate2: ICandidate = {
  name: 'candidate2',
  author: 'author2',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate2-image',
};

export const candidate3: ICandidate = {
  name: 'candidate3',
  author: 'author3',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
  image: 'candidate3-image',
};

export const suite1: ISuite = {
  name: 'suite1',
  author: 'author1',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

export const suite2: ISuite = {
  name: 'suite2',
  author: 'author2',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

export const suite3: ISuite = {
  name: 'suite3',
  author: 'author3',
  version: apiVersion,
  benchmark: 'benchmark1',
  mode: 'mode1',
};

const runid = '69bd5df9-48a2-4fd0-81c5-0a7d6932eef2';
export const run1: IRun = {
  name: runid,
  author: 'author1',
  version: apiVersion,
  benchmark: benchmark1,
  candidate: candidate1,
  suite: suite1,
  blob: new URL(runid, blobBase).toString(),
  status: RunStatus.CREATED,
};
