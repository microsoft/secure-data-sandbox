//const axios = require('axios').default;
import axios from 'axios';

import {
  IBenchmark,
  ICandidate,
  ILaboratory,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  Measures,
  RunStatus,
} from '..';

class LaboratoryClient implements ILaboratory {
  endpoint: string;

  constructor(endpoint: string, {}) {
    this.endpoint = endpoint;
  }

  async allBenchmarks(): Promise<IBenchmark[]> {
    axios.get(this.endpoint).then();
    const response = await axios.get(this.endpoint);
    console.log(JSON.stringify(response.data));

    throw new TypeError('Not implemented');
  }

  async oneBenchmark(name: string): Promise<IBenchmark> {
    throw new TypeError('Not implemented');
  }

  async upsertBenchmark(benchmark: IBenchmark, name?: string): Promise<void> {
    throw new TypeError('Not implemented');
  }

  async allCandidates(): Promise<ICandidate[]> {
    throw new TypeError('Not implemented');
  }

  async oneCandidate(name: string): Promise<ICandidate> {
    throw new TypeError('Not implemented');
  }

  async upsertCandidate(candidate: ICandidate, name?: string): Promise<void> {
    throw new TypeError('Not implemented');
  }

  async allSuites(): Promise<ISuite[]> {
    throw new TypeError('Not implemented');
  }

  async oneSuite(name: string): Promise<ISuite> {
    throw new TypeError('Not implemented');
  }

  async upsertSuite(suite: ISuite, name?: string): Promise<void> {
    throw new TypeError('Not implemented');
  }

  async allRuns(): Promise<IRun[]> {
    throw new TypeError('Not implemented');
  }

  async oneRun(name: string): Promise<IRun> {
    throw new TypeError('Not implemented');
  }

  async createRunRequest(spec: IRunRequest): Promise<IRun> {
    throw new TypeError('Not implemented');
  }

  async updateRunStatus(name: string, status: RunStatus): Promise<void> {
    throw new TypeError('Not implemented');
  }

  async reportRunResults(name: string, measures: Measures): Promise<void> {
    throw new TypeError('Not implemented');
  }

  async allRunResults(benchmark: string, suite: string): Promise<IResult[]> {
    throw new TypeError('Not implemented');
  }
}
