import { ColumnDescription } from "../cloud";

export enum Kind {
    BENCHMARK = 'Benchmark',
    CANDIDATE = 'Candidate',
    LABORATORY = 'Laboratory',
    LOG = 'Log',
    RUN = 'Run',
    SUITE = 'Suite',
    WHITELIST = 'Whitelist'
}

export interface SpecificationBase {
    apiVersion: string,
    kind: Kind,
}

export interface SpecificationMetadata {
    creator: string;
    creationDate: string;
}

export interface LaboratoryDescription extends SpecificationBase {
    apiVersion: '0.0.1';
    kind: Kind.LABORATORY;

    laboratory: {
        host: string;
        port: number;
    }
    repository: {
        host: string;
        port: number;
    }
}

export interface BenchmarkDescription extends SpecificationBase {
    apiVersion: '0.0.1';
    kind: Kind.BENCHMARK,

    name: string;
    description?: string;
    homepage?: string;

    image: string;
    columns: ColumnDescription[]
}

export interface CandidateDescription extends SpecificationBase {
    apiVersion: '0.0.1';
    kind: Kind.CANDIDATE,

    name: string;
    description?: string;

    benchmarkId: string;
    image: string;
    whitelist: string[];

    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    data?: object
}

// TODO: ISSUE: do suites refer to versioned or unversioned benchmark
// containers?
export interface SuiteDescription extends SpecificationBase {
    apiVersion: '0.0.1';
    kind: Kind.SUITE,

    name: string;
    description: string;

    benchmarkId: string;

    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    data?: object
}

export interface RunDescription extends SpecificationBase {
    apiVersion: '0.0.1';
    kind: Kind.RUN,

    candidateId: string;
    suiteId: string;
}

export type BenchmarkSpecification = BenchmarkDescription & SpecificationMetadata;
export type CandidateSpecification = CandidateDescription & SpecificationMetadata;
export type SuiteSpecification = SuiteDescription & SpecificationMetadata;
export interface RunSpecification extends RunDescription, SpecificationMetadata {
    runId: string;
    benchmarkId: string;
}

// Descriptions that can be uploaded from the CLI.
// Laborotory.create() takes AnyDescription.
export type AnyDescription = 
    BenchmarkDescription |
    CandidateDescription |
    RunDescription |
    SuiteDescription;

// Specifications that can be stored as blobs.
export type AnySpecification = 
    BenchmarkSpecification |
    CandidateSpecification | 
    RunSpecification |
    SuiteSpecification;

// TODO: should these methods take a credentials string?
// tslint:disable-next-line:interface-name
export interface ILaboratory {
    create(description: AnyDescription): Promise<string>;   
    run(candidateId: string, suiteId: string): Promise<void>;
}
