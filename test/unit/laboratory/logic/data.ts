///////////////////////////////////////////////////////////////////////////////
//
// Data for tests in this directory.
//
///////////////////////////////////////////////////////////////////////////////
import {
  apiVersion,
  IBenchmark,
  ICandidate,
  IPipeline,
  ISuite,
  ResultColumn,
  ResultColumnType,
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

export const columns: ResultColumn[] = [
  { name: 'pass', type: ResultColumnType.INT },
  { name: 'fail', type: ResultColumnType.INT },
];

export const benchmark1: IBenchmark = {
  name: 'benchmark1',
  author: 'author1',
  version: apiVersion,
  pipelines,
  columns,
};

export const benchmark2: IBenchmark = {
  name: 'benchmark2',
  author: 'author2',
  version: apiVersion,
  pipelines,
  columns,
};

export const benchmark3: IBenchmark = {
  name: 'benchmark3',
  author: 'author3',
  version: apiVersion,
  pipelines,
  columns,
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
