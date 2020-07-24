///////////////////////////////////////////////////////////////////////////////
//
// Data for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import { URL } from 'url';

import {
  IBenchmark,
  ICandidate,
  IRun,
  IRunRequest,
  ISuite,
  RunStatus,
} from '../../../src';

export const serviceURL = 'http://localhost:3000'; // TODO: plumb real url.
export const blobBase = 'http://blobs';

export const timestamps = {
  createdAt: new Date('2020-03-19T21:37:31.452Z'),
  updatedAt: new Date('2020-03-20T22:37:31.452Z'),
};

export const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  mode: 'mode1',
  stages: [
    {
      // Candidate
    },
    {
      // Benchmark
      image: 'benchmark-image',
    },
  ],
  ...timestamps,
};

export const benchmark2: IBenchmark = {
  name: 'benchmark2',
  author: 'author2',
  mode: 'mode1',
  stages: [
    {
      // Candidate
    },
    {
      // Benchmark
      image: 'benchmark-image',
    },
  ],
  ...timestamps,
};

export const benchmark3: IBenchmark = {
  name: 'benchmark3',
  author: 'author3',
  mode: 'mode1',
  stages: [
    {
      // Candidate
    },
    {
      // Benchmark
      image: 'benchmark-image',
    },
  ],
  ...timestamps,
};

export const candidate1: ICandidate = {
  name: 'candidate1',
  author: 'author1',
  benchmark: 'benchmark1',
  image: 'candidate1-image',
  ...timestamps,
};

export const candidate2: ICandidate = {
  name: 'candidate2',
  author: 'author2',
  benchmark: 'benchmark1',
  image: 'candidate2-image',
  ...timestamps,
};

export const candidate3: ICandidate = {
  name: 'candidate3',
  author: 'author3',
  benchmark: 'benchmark1',
  image: 'candidate3-image',
  ...timestamps,
};

export const suite1: ISuite = {
  name: 'suite1',
  author: 'author1',
  benchmark: 'benchmark1',
  ...timestamps,
};

export const suite2: ISuite = {
  name: 'suite2',
  author: 'author2',
  benchmark: 'benchmark1',
  ...timestamps,
};

export const suite3: ISuite = {
  name: 'suite3',
  author: 'author3',
  benchmark: 'benchmark1',
  ...timestamps,
};

export const runRequest1: IRunRequest = {
  candidate: 'candidate1',
  suite: 'suite1',
};

const runid = '69bd5df9-48a2-4fd0-81c5-0a7d6932eef2';
export const run1: IRun = {
  name: runid,
  author: 'author1',
  benchmark: benchmark1,
  candidate: candidate1,
  suite: suite1,
  blob: new URL(runid, blobBase).toString(),
  status: RunStatus.CREATED,
  ...timestamps,
};
