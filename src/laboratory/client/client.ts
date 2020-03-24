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
function jsonParser(data: any, headers: any): any {
  return JSON.parse(data, entityBaseReviver);
  // try {
  //   // console.log(`jsonParser: text="${data}"`);
  //   // console.log(`jsonParser: headers="${JSON.stringify(headers)}"`);
  //   return JSON.parse(data, entityBaseReviver);
  // } catch (e) {
  //   // JSON parsing can fail in when response has an error status.
  //   // In this case, response.data is not JSON.
  //   return data;
  // }
}

const config: AxiosRequestConfig = {
  // TODO: put credentials here.
  responseType: 'json',
};
const configForGet: AxiosRequestConfig = {
  ...config,
  transformResponse: [jsonParser],
};

const configForPatchPostPut: AxiosRequestConfig = {
  ...config,
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

    const benchmark = await axios
      .get(url.toString(), configForGet)
      .then(response => {
        return validate(BenchmarkType, response.data);
      });
    // .catch( e => {
    //   console.log(`.catch: ${e.message}`);
    //   throw e;
    // });

    return benchmark;

    // console.log('hello');
    // const response = await axios.get(url.toString(), configForGet);
    // console.log(`Response status = ${response.status}`);
    // if (response.status !== 200) {
    //   const message = `HTTP GET from ${url.toString()} returns ${response.status}`;
    //   throw new TypeError(message);
    // }

    // const benchmark = validate(BenchmarkType, response.data);
    // return benchmark;
  }

  async upsertBenchmark(
    benchmark: IBenchmark,
    routeName?: string
  ): Promise<void> {
    const name = normalizeName(benchmark.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = `Route name, if specified, must equal benchmark.name.`;
      throw new TypeError(message);
    }
    const url = new URL(`benchmarks/${name}`, this.endpoint);
    await axios.put(url.toString(), benchmark, config);
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
      throw new TypeError(message);
    }
    const url = new URL(`candidates/${name}`, this.endpoint);
    await axios.put(url.toString(), candidate, config);
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
      throw new TypeError(message);
    }
    const url = new URL(`suites/${name}`, this.endpoint);
    await axios.put(url.toString(), suite, config);
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
    const response = await axios.post(url.toString(), spec, config);
    const run = validate(RunType, response.data);
    return run;
  }

  async updateRunStatus(rawName: string, status: RunStatus): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}`, this.endpoint);
    const body: IUpdateRunStatus = { status };
    await axios.patch(url.toString(), body, config);
  }

  async reportRunResults(rawName: string, measures: Measures): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}/results`, this.endpoint);
    const body: IReportRunResults = { measures };
    await axios.patch(url.toString(), body, config);
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
