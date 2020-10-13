import axios, { AxiosInstance } from 'axios';

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
  ResultArrayType,
  RunArrayType,
  RunStatus,
  RunType,
  SuiteArrayType,
  SuiteType,
} from '../interfaces';
import { normalizeName, normalizeRunName } from '../normalize';
import { validate } from '../validate';

// A TokenRetriever should return a valid OAuth2 Bearer token
type TokenRetriever = () => Promise<string>;

export class LaboratoryClient implements ILaboratory {
  http: AxiosInstance;

  constructor(endpoint: string, tokenRetriever?: TokenRetriever) {
    this.http = axios.create({
      baseURL: endpoint,
      validateStatus: status => status >= 200 && status < 300,
    });

    this.http.interceptors.request.use(
      async config => {
        if (tokenRetriever) {
          config.headers.Authorization = `Bearer ${await tokenRetriever()}`;
        }
        return config;
      },
      error => {
        Promise.reject(error);
      }
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Connection info
  //
  /////////////////////////////////////////////////////////////////////////////
  async negotiateConnection(): Promise<IClientConnectionInfo> {
    const response = await this.http.get('/connect');
    const connectionInfo = validate(ClientConnectionInfoType, response.data);
    return connectionInfo;
  }

  async validateConnection(): Promise<void> {
    const response = await this.http.get('/connect/validate');
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
    const response = await this.http.get('/benchmarks');
    const benchmarks = validate(BenchmarkArrayType, response.data);
    return benchmarks;
  }

  async oneBenchmark(rawName: string): Promise<IBenchmark> {
    const name = normalizeName(rawName);
    const response = await this.http.get(`/benchmarks/${name}`);
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
    await this.http.put(`/benchmarks/${name}`, benchmark);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Candidates
  //
  /////////////////////////////////////////////////////////////////////////////
  async allCandidates(): Promise<ICandidate[]> {
    const response = await this.http.get('/candidates');
    const candidates = validate(CandidateArrayType, response.data);
    return candidates;
  }

  async oneCandidate(rawName: string): Promise<ICandidate> {
    const name = normalizeName(rawName);
    const response = await this.http.get(`/candidates/${name}`);
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
    await this.http.put(`/candidates/${name}`, candidate);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Suites
  //
  /////////////////////////////////////////////////////////////////////////////
  async allSuites(): Promise<ISuite[]> {
    const response = await this.http.get('/suites');
    const suites = validate(SuiteArrayType, response.data);
    return suites;
  }

  async oneSuite(rawName: string): Promise<ISuite> {
    const name = normalizeName(rawName);
    const response = await this.http.get(`/suites/${name}`);
    const suite = validate(SuiteType, response.data);
    return suite;
  }

  async upsertSuite(suite: ISuite, routeName?: string): Promise<void> {
    const name = normalizeName(suite.name);
    if (routeName && name !== normalizeName(routeName)) {
      const message = 'Route name, if specified, must equal suite.name.';
      throw new IllegalOperationError(message);
    }
    await this.http.put(`/suites/${name}`, suite);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Runs
  //
  /////////////////////////////////////////////////////////////////////////////
  async allRuns(): Promise<IRun[]> {
    const response = await this.http.get('/runs');
    const runs = validate(RunArrayType, response.data);
    return runs;
  }

  async oneRun(rawName: string): Promise<IRun> {
    const name = normalizeRunName(rawName);
    const response = await this.http.get(`/runs/${name}`);
    const run = validate(RunType, response.data);
    return run;
  }

  async createRunRequest(spec: IRunRequest): Promise<IRun> {
    const response = await this.http.post('/runs', spec);
    const run = validate(RunType, response.data);
    return run;
  }

  async updateRunStatus(rawName: string, status: RunStatus): Promise<void> {
    const name = normalizeRunName(rawName);
    const body: IUpdateRunStatus = { status };
    await this.http.patch(`/runs/${name}`, body);
  }

  async reportRunResults(rawName: string, measures: Measures): Promise<void> {
    const name = normalizeRunName(rawName);
    const body: IReportRunResults = { measures };
    await this.http.post(`/runs/${name}/results`, body);
  }

  async allRunResults(benchmark: string, suite: string): Promise<IResult[]> {
    const b = normalizeName(benchmark);
    const s = normalizeName(suite);
    const response = await this.http.get(
      `/runs/results?benchmark=${b}&suite=${s}`
    );
    const results = validate(ResultArrayType, response.data);
    return results;
  }
}
