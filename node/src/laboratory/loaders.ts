import * as yaml from 'js-yaml';

import { IBlobStorage } from '../cloud';
import { getPath } from '../naming';

import {
  AnyDescription,
  BenchmarkSpecification,
  CandidateSpecification,
  //    EntityDescription,
  Kind,
  // LaboratorySpecification,
  RunSpecification,
  SuiteSpecification,
  // AnyDescription,
} from './interfaces';

import { validateAsAnyDescription, validateAsKindDescription } from './schemas';

export async function loadBenchmark(
  name: string,
  storage: IBlobStorage
): Promise<BenchmarkSpecification> {
  const blob = getPath(Kind.BENCHMARK, name);
  const buffer = await storage.readBlob(blob);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText) as BenchmarkSpecification;
  validateAsKindDescription(Kind.BENCHMARK, data);
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
  validateAsKindDescription(Kind.CANDIDATE, data);
  return data;
}

// export async function loadLaboratory(
//     name: string,
//     storage: IStorage
// ): Promise<LaboratoryDescription> {
//     const buffer = await storage.readBlob(name);
//     const yamlText = buffer.toString('utf8');
//     const data = yaml.safeLoad(yamlText) as LaboratoryDescription;
//     validateAsKindDescription(Kind.LABORATORY, data);
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
  validateAsKindDescription(Kind.RUN, data);
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
  validateAsKindDescription(Kind.SUITE, data);
  return data;
}

export async function loadDescription(
  filename: string,
  storage: IBlobStorage
): Promise<AnyDescription> {
  const buffer = await storage.readBlob(filename);
  const yamlText = buffer.toString('utf8');
  const data = yaml.safeLoad(yamlText);

  return validateAsAnyDescription(data);
}
