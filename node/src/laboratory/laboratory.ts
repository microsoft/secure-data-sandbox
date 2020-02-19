import * as yaml from 'js-yaml';

import { World } from '../cloud';
import { specToPath, createRunId, encodeAndVerify } from '../naming';

import {
  AnyDescription,
  AnySpecification,
  BenchmarkSpecification,
  CandidateSpecification,
  ILaboratory,
  Kind,
  SpecificationMetadata,
  SuiteSpecification,
  RunSpecification,
} from './interfaces';

import { loadBenchmark, loadCandidate, loadSuite } from './loaders';

export class Laboratory implements ILaboratory {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  async create(description: AnyDescription): Promise<string> {
    const metaData: SpecificationMetadata = {
      // TODO: implement correctly. Also removed duplicated version in run().
      creator: 'user',
      creationDate: new Date().toISOString(),
    };

    let spec: AnySpecification;
    let name: string;
    switch (description.kind) {
      case Kind.BENCHMARK:
        name = encodeAndVerify(description.name);
        spec = { ...description, ...metaData, name };
        break;
      case Kind.CANDIDATE:
        // TODO: validate benchmark
        name = encodeAndVerify(description.name);
        spec = { ...description, ...metaData };
        break;
      case Kind.SUITE:
        // TODO: validate benchmark
        name = encodeAndVerify(description.name);
        spec = { ...description, ...metaData };
        break;
      default:
        const message = `Laboratory.create(): unsupported kind==="${description.kind}"`;
        this.world.logger.log(message);
        throw new TypeError(message);
    }

    const blob = specToPath(spec);
    const buffer = Buffer.from(yaml.safeDump(spec), 'utf8');

    try {
      await this.world.cloudStorage.writeBlob(blob, buffer, false);
      this.world.logger.log(`Uploaded ${spec.kind} schema to ${blob}`);
      return blob;
    } catch (e) {
      // TODO: check for attempted blob overwrite exception.
      throw e;
    }
  }

  async run(candidate: string, suite: string): Promise<string> {
    const candidateId = encodeAndVerify(candidate);
    const suiteId = encodeAndVerify(suite);

    const metaData: SpecificationMetadata = {
      // TODO: implement correctly. Also removed duplicated version in create().
      creator: 'user',
      creationDate: new Date().toISOString(),
    };

    this.world.logger.log(`run(${candidateId}, ${suiteId})`);

    let suiteData: SuiteSpecification;
    try {
      suiteData = await loadSuite(suiteId, this.world.cloudStorage);
    } catch (e) {
      // TODO: only change exception when file not found.
      const message = `Cannot find suite ${suiteId}`;
      throw new TypeError(message);
    }

    let candidateData: CandidateSpecification;
    try {
      candidateData = await loadCandidate(candidateId, this.world.cloudStorage);
    } catch (e) {
      // TODO: only change exception when file not found.
      const message = `Cannot find candidate ${candidateId}`;
      throw new TypeError(message);
    }

    if (suiteData.benchmarkId !== candidateData.benchmarkId) {
      const message = 'Suite and Candidate benchmarks must match.';
      this.world.logger.log(message);
      throw new TypeError(message);
    }

    const benchmarkId = encodeAndVerify(suiteData.benchmarkId);
    let benchmarkData: BenchmarkSpecification;
    try {
      benchmarkData = await loadBenchmark(benchmarkId, this.world.cloudStorage);
    } catch (e) {
      // TODO: only change exception when file not found.
      const message = `Cannot find benchmark ${benchmarkId}`;
      throw new TypeError(message);
    }

    const spec: RunSpecification = {
      apiVersion: '0.0.1',
      kind: Kind.RUN,

      candidateId,
      suiteId,

      ...metaData,

      runId: createRunId(),
      benchmarkId,
    };

    // Write specification to blob storage
    const blob = specToPath(spec);
    const buffer = Buffer.from(yaml.safeDump(spec), 'utf8');
    try {
      await this.world.cloudStorage.writeBlob(blob, buffer, false);
      this.world.logger.log(`Uploaded ${spec.kind} schema to ${blob}`);
    } catch (e) {
      // TODO: check for attempted blob overwrite exception.
      throw e;
    }

    // Write specification to worker queue
    await this.world.queueStorage.enqueue(buffer);
    this.world.logger.log(`Queued run ${spec.runId}`);

    return spec.runId;
  }
}
