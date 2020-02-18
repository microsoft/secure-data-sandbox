import * as yaml from 'js-yaml';

import { IBlobStorage } from '../cloud';
import { getPath } from '../naming';

import {
  BenchmarkSpecification,
  CandidateSpecification,
  //    EntityDescription,
  Kind,
  // LaboratorySpecification,
  RunSpecification,
  SuiteSpecification,
  // AnyDescription,
} from './interfaces';

// import { validateAsAnyDescription } from './schemas';

export async function loadBenchmark(
  name: string,
  storage: IBlobStorage
): Promise<BenchmarkSpecification> {
  const blob = getPath(Kind.BENCHMARK, name);
  const buffer = await storage.readBlob(blob);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText) as BenchmarkSpecification;
  return data;
}

export async function loadCandidate(
  name: string,
  storage: IBlobStorage
): Promise<CandidateSpecification> {
  const blob = getPath(Kind.CANDIDATE, name);
  const buffer = await storage.readBlob(blob);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText) as CandidateSpecification;
  return data;
}

// export async function loadLaboratory(
//     name: string,
//     storage: IStorage
// ): Promise<LaboratoryDescription> {
//     const buffer = await storage.readBlob(name);
//     const yamlText = buffer.toString('utf8');
//     const data = yaml.safeLoad(yamlText) as LaboratoryDescription;
//     return data;
// }

export async function loadRun(
  name: string,
  storage: IBlobStorage
): Promise<RunSpecification> {
  const blob = getPath(Kind.RUN, name);
  const buffer = await storage.readBlob(blob);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText) as RunSpecification;
  return data;
}

export async function loadSuite(
  name: string,
  storage: IBlobStorage,
  encodeName = true
): Promise<SuiteSpecification> {
  const blob = getPath(Kind.SUITE, name);
  const buffer = await storage.readBlob(blob);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText) as SuiteSpecification;
  return data;
}
