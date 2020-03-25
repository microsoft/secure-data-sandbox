import axios, { AxiosRequestConfig } from 'axios';
import { URL } from 'url';

import {
  BenchmarkArrayType,
  BenchmarkType,
  CandidateArrayType,
  CandidateType,
  IBenchmark,
  ICandidate,
  ILaboratory,
  IllegalOperationError,
  IReportRunResults,
  IResult,
  IRun,
  IRunRequest,
  ISuite,
  IUpdateRunStatus,
  Measures,
  normalizeName,
  normalizeRunName,
  ResultArrayType,
  RunArrayType,
  RunStatus,
  RunType,
  SuiteArrayType,
  SuiteType,
  validate,
} from '../logic';

import { entityBaseReviver } from '../server';

// tslint:disable-next-line:no-any
function jsonParser(data: any): any {
  try {
    return JSON.parse(data, entityBaseReviver);
  } catch (e) {
    // Not all payloads are JSON. Some POSTs and PUTS return "OK"
    return data;
  }
}

const config: AxiosRequestConfig = {
  // TODO: put credentials here.
};

const configForGet: AxiosRequestConfig = {
  ...config,
  transformResponse: [jsonParser],
};

const configForPatchPostPut: AxiosRequestConfig = {
  ...config,
  transformResponse: [jsonParser],
};

export class LaboratoryClient implements ILaboratory {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // TODO: error handling pattern/strategy

  /////////////////////////////////////////////////////////////////////////////
  //
  // Benchmarks
  //
  /////////////////////////////////////////////////////////////////////////////
  async allBenchmarks(): Promise<IBenchmark[]> {
    const url = new URL('benchmarks', this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const benchmarks = validate(BenchmarkArrayType, response.data);
    return benchmarks;
  }

  async oneBenchmark(rawName: string): Promise<IBenchmark> {
    const name = normalizeName(rawName);
    const url = new URL(`benchmarks/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const benchmark = validate(BenchmarkType, response.data);
    return benchmark;
  }

  async upsertBenchmark(
    benchmark: IBenchmark,
    routeName?: string
  ): Promise<void> {
    const name = normalizeName(benchmark.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = `Route name, if specified, must equal benchmark.name.`;
      throw new IllegalOperationError(message);
    }
    const url = new URL(`benchmarks/${name}`, this.endpoint);
    await axios.put(url.toString(), benchmark, configForPatchPostPut);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Candidates
  //
  /////////////////////////////////////////////////////////////////////////////
  async allCandidates(): Promise<ICandidate[]> {
    const url = new URL('candidates', this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const candidates = validate(CandidateArrayType, response.data);
    return candidates;
  }

  async oneCandidate(rawName: string): Promise<ICandidate> {
    const name = normalizeName(rawName);
    const url = new URL(`candidates/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const candidate = validate(CandidateType, response.data);
    return candidate;
  }

  async upsertCandidate(
    candidate: ICandidate,
    routeName?: string
  ): Promise<void> {
    const name = normalizeName(candidate.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = `Route name, if specified, must equal candidate.name.`;
      throw new IllegalOperationError(message);
    }
    const url = new URL(`candidates/${name}`, this.endpoint);
    await axios.put(url.toString(), candidate, configForPatchPostPut);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  /////////////////////////////////////////////////////////////////////////////
  async allSuites(): Promise<ISuite[]> {
    const url = new URL('suites', this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const suites = validate(SuiteArrayType, response.data);
    return suites;
  }

  async oneSuite(rawName: string): Promise<ISuite> {
    const name = normalizeName(rawName);
    const url = new URL(`suites/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const suite = validate(SuiteType, response.data);
    return suite;
  }

  async upsertSuite(suite: ISuite, routeName?: string): Promise<void> {
    const name = normalizeName(suite.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = `Route name, if specified, must equal suite.name.`;
      throw new IllegalOperationError(message);
    }
    const url = new URL(`suites/${name}`, this.endpoint);
    await axios.put(url.toString(), suite, configForPatchPostPut);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  /////////////////////////////////////////////////////////////////////////////
  async allRuns(): Promise<IRun[]> {
    const url = new URL('runs', this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const runs = validate(RunArrayType, response.data);
    return runs;
  }

  async oneRun(rawName: string): Promise<IRun> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const run = validate(RunType, response.data);
    return run;
  }

  async createRunRequest(spec: IRunRequest): Promise<IRun> {
    const url = new URL('runs', this.endpoint);
    const response = await axios.post(
      url.toString(),
      spec,
      configForPatchPostPut
    );
    const run = validate(RunType, response.data);
    return run;
  }

  async updateRunStatus(rawName: string, status: RunStatus): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}`, this.endpoint);
    const body: IUpdateRunStatus = { status };
    await axios.patch(url.toString(), body, configForPatchPostPut);
  }

  async reportRunResults(rawName: string, measures: Measures): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}/results`, this.endpoint);
    const body: IReportRunResults = { measures };
    await axios.patch(url.toString(), body, configForPatchPostPut);
  }

  async allRunResults(benchmark: string, suite: string): Promise<IResult[]> {
    const b = normalizeName(benchmark);
    const s = normalizeName(suite);
    const url = new URL(`runs/${b}/${s}`, this.endpoint);
    const response = await axios.get(url.toString(), configForGet);
    const results = validate(ResultArrayType, response.data);
    return results;
  }
}
