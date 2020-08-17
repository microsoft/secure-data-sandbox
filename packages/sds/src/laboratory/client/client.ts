import axios, { AxiosRequestConfig } from 'axios';
import { URL } from 'url';

import {
  BenchmarkArrayType,
  BenchmarkType,
  CandidateArrayType,
  CandidateType,
  ClientConnectionInfoType,
  IBenchmark,
  ICandidate,
  IClientConnectionInfo,
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

// A TokenRetriever should return a valid OAuth2 Bearer token
type TokenRetriever = () => Promise<string>;

export class LaboratoryClient implements ILaboratory {
  endpoint: string;
  tokenRetriever?: TokenRetriever;

  constructor(endpoint: string, tokenRetriever?: TokenRetriever) {
    this.endpoint = endpoint;
    this.tokenRetriever = tokenRetriever;
  }

  private async getConfig(): Promise<AxiosRequestConfig> {
    if (this.tokenRetriever) {
      return {
        headers: {
          Authorization: `Bearer ${await this.tokenRetriever()}`,
        },
      };
    }

    return {};
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Connection info
  //
  /////////////////////////////////////////////////////////////////////////////
  async negotiateConnection(): Promise<IClientConnectionInfo> {
    const url = new URL('connect', this.endpoint);
    const response = await axios.get(url.toString());
    const connectionInfo = validate(ClientConnectionInfoType, response.data);
    return connectionInfo;
  }

  async validateConnection(): Promise<void> {
    const url = new URL('connect/validate', this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    if (response.status !== 200) {
      throw new Error('There was something wrong with the connection');
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Benchmarks
  //
  /////////////////////////////////////////////////////////////////////////////
  async allBenchmarks(): Promise<IBenchmark[]> {
    const url = new URL('benchmarks', this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const benchmarks = validate(BenchmarkArrayType, response.data);
    return benchmarks;
  }

  async oneBenchmark(rawName: string): Promise<IBenchmark> {
    const name = normalizeName(rawName);
    const url = new URL(`benchmarks/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const benchmark = validate(BenchmarkType, response.data);
    return benchmark;
  }

  async upsertBenchmark(
    benchmark: IBenchmark,
    routeName?: string
  ): Promise<void> {
    const name = normalizeName(benchmark.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = 'Route name, if specified, must equal benchmark.name.';
      throw new IllegalOperationError(message);
    }
    const url = new URL(`benchmarks/${name}`, this.endpoint);
    await axios.put(url.toString(), benchmark, await this.getConfig());
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Candidates
  //
  /////////////////////////////////////////////////////////////////////////////
  async allCandidates(): Promise<ICandidate[]> {
    const url = new URL('candidates', this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const candidates = validate(CandidateArrayType, response.data);
    return candidates;
  }

  async oneCandidate(rawName: string): Promise<ICandidate> {
    const name = normalizeName(rawName);
    const url = new URL(`candidates/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const candidate = validate(CandidateType, response.data);
    return candidate;
  }

  async upsertCandidate(
    candidate: ICandidate,
    routeName?: string
  ): Promise<void> {
    const name = normalizeName(candidate.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = 'Route name, if specified, must equal candidate.name.';
      throw new IllegalOperationError(message);
    }
    const url = new URL(`candidates/${name}`, this.endpoint);
    await axios.put(url.toString(), candidate, await this.getConfig());
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  /////////////////////////////////////////////////////////////////////////////
  async allSuites(): Promise<ISuite[]> {
    const url = new URL('suites', this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const suites = validate(SuiteArrayType, response.data);
    return suites;
  }

  async oneSuite(rawName: string): Promise<ISuite> {
    const name = normalizeName(rawName);
    const url = new URL(`suites/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const suite = validate(SuiteType, response.data);
    return suite;
  }

  async upsertSuite(suite: ISuite, routeName?: string): Promise<void> {
    const name = normalizeName(suite.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = 'Route name, if specified, must equal suite.name.';
      throw new IllegalOperationError(message);
    }
    const url = new URL(`suites/${name}`, this.endpoint);
    await axios.put(url.toString(), suite, await this.getConfig());
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  /////////////////////////////////////////////////////////////////////////////
  async allRuns(): Promise<IRun[]> {
    const url = new URL('runs', this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const runs = validate(RunArrayType, response.data);
    return runs;
  }

  async oneRun(rawName: string): Promise<IRun> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}`, this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const run = validate(RunType, response.data);
    return run;
  }

  async createRunRequest(spec: IRunRequest): Promise<IRun> {
    const url = new URL('runs', this.endpoint);
    const response = await axios.post(
      url.toString(),
      spec,
      await this.getConfig()
    );
    const run = validate(RunType, response.data);
    return run;
  }

  async updateRunStatus(rawName: string, status: RunStatus): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}`, this.endpoint);
    const body: IUpdateRunStatus = { status };
    await axios.patch(url.toString(), body, await this.getConfig());
  }

  async reportRunResults(rawName: string, measures: Measures): Promise<void> {
    const name = normalizeRunName(rawName);
    const url = new URL(`runs/${name}/results`, this.endpoint);
    const body: IReportRunResults = { measures };
    await axios.post(url.toString(), body, await this.getConfig());
  }

  async allRunResults(benchmark: string, suite: string): Promise<IResult[]> {
    const b = normalizeName(benchmark);
    const s = normalizeName(suite);
    const url = new URL(`runs?benchmark=${b}&suite=${s}`, this.endpoint);
    const response = await axios.get(url.toString(), await this.getConfig());
    const results = validate(ResultArrayType, response.data);
    return results;
  }
}
