import { Command } from 'commander';
import * as fs from 'fs';
import { Decoder } from 'io-ts';
import * as yaml from 'js-yaml';
import { DateTime } from 'luxon';
import * as path from 'path';

import {
  BenchmarkType,
  CandidateType,
  IBenchmark,
  ICandidate,
  IEntityBase,
  IllegalOperationError,
  IRun,
  ISuite,
  SuiteType,
  validate,
} from '../laboratory';

import { initConnection, getLabClient } from './conn';
import { decodeError } from './decode_error';
import { configureDemo } from './demo';
import { formatChoices, formatTable, Alignment } from './formatting';

const readme =
  'https://github.com/microsoft/secure-data-sandbox/blob/main/laboratory/README.md';

function main(argv: string[]) {
  const program = new Command();

  program.description('Secure Data Sandbox CLI');

  program
    .command('connect [service]')
    .description('Connect to a Laboratory [service] or print connection info.')
    .action(connect);

  program
    .command('create <type> <spec>')
    .description(
      'Create a benchmark, candidate, or suite from a specification where <type> is either "benchmark", "candidate", or "suite".'
    )
    .action(create);

  program
    .command('demo')
    .description('Configures Laboratory service with demo data.')
    .action(() => demo());

  program
    .command('deploy <server>')
    .description('NOT YET IMPLEMENTED. Deploy a Laboratory service.')
    .action(deploy);

  program
    .command('examples')
    .description('Show usage examples.')
    .action(() => examples(argv));

  program
    .command('list <type>')
    .description(
      'Display summary information about benchmarks, candidates, runs, and suites.'
    )
    .action(list);

  program
    .command('results <benchmark> <suite>')
    .description(
      'Display the results of all runs against a named benchmark and suite.'
    )
    .action(results);

  program
    .command('run <candidate> <suite>')
    .description('Run a named <candidate> against a named <suite>.')
    .action(run);

  program
    .command('show <type> [name]')
    .description(
      'Display all benchmarks, candidates, suites, or runs. If optional [name] is specified, only show matching items.'
    )
    .action(show);

  program.on('--help', () => {
    console.log();
    console.log(`For more information and examples, see ${readme}`);
  });

  process.on('unhandledRejection', e => {
    if (e instanceof Error) {
      const message = decodeError(e);
      console.log(`Error: ${message}`);
    } else {
      console.log('Unknown error.');
    }
    process.exitCode = 1;
  });

  program.parse(argv);
}

function examples(argv: string[]) {
  const examples = [
    [
      'connect http://localhost:3000',
      'Connect the CLI to a laboratory service on localhost.',
    ],
    ['list benchmark', 'List benchmarks.'],
    ['list candidate', 'List candidates.'],
    ['list suite', 'List suites.'],
    ['list run', 'List runs.'],
    ['show benchmark', 'Display specifications for all benchmarks.'],
    ['show benchmark foo', 'Display specification for benchmark foo.'],
    ['show candidate', 'Display specifications for all candidates.'],
    ['show candidate bar', 'Display specification for candidate bar.'],
    ['show suite', 'Display specifications for all suites.'],
    ['show suite baz', 'Display specification for suite baz.'],
    ['run bar baz', 'Run candidate bar on suite baz.'],
    [
      'results foo baz',
      'Display results for runs against benchmark and suite baz.',
    ],
  ];

  const program = path.basename(argv[1]);
  const alignments = [Alignment.LEFT, Alignment.LEFT];
  const rows: string[][] = [];
  for (const [cmd, text] of examples) {
    rows.push([`node ${program} ${cmd}`, text]);
  }

  console.log(`For more information and examples, see ${readme}`);
  console.log();
  for (const row of formatTable(alignments, rows)) {
    console.log(row);
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Connect
//
///////////////////////////////////////////////////////////////////////////////
async function connect(host: string) {
  if (host === undefined) {
    throw new Error('You must specify a host.');
  }

  await initConnection(host);
  console.log(`Connected to ${host}.`);
}

///////////////////////////////////////////////////////////////////////////////
//
// Create
//
///////////////////////////////////////////////////////////////////////////////
async function create(type: string, spec: string) {
  await dispatch(type, ['benchmark', 'candidate', 'suite'], createHelper, [
    spec,
  ]);
  console.log(`${type} created`);
}

async function createHelper<T>(ops: ISpecOps<T>, specFile: string) {
  const spec = ops.load(specFile);
  await ops.upsert(spec);
}

///////////////////////////////////////////////////////////////////////////////
//
// Demo
//
///////////////////////////////////////////////////////////////////////////////
async function demo() {
  configureDemo(await getLabClient());
}

///////////////////////////////////////////////////////////////////////////////
//
// Deploy
//
///////////////////////////////////////////////////////////////////////////////
async function deploy() {
  console.log(`deploy command not implemented.`);
}

///////////////////////////////////////////////////////////////////////////////
//
// List
//
///////////////////////////////////////////////////////////////////////////////
async function list(type: string) {
  // Idea: use type to either go to dispatch() or a custom runListHelper.
  await dispatch(type, ['benchmark', 'candidate', 'run', 'suite'], listHelper, [
    type,
  ]);
}

async function listHelper<T extends IEntityBase>(
  ops: ISpecOps<T>,
  type: string
) {
  const specs = await ops.all();

  if (specs.length === 0) {
    console.log(`No matching ${ops.name()}`);
  } else {
    const alignments: Alignment[] = [
      Alignment.LEFT,
      Alignment.LEFT,
      Alignment.LEFT,
    ];
    const header = ['name', 'submitter', 'date'];
    if (type === 'run') {
      // alignments.push(Alignment.LEFT);
      alignments.push(Alignment.LEFT);
      alignments.push(Alignment.LEFT);
      alignments.push(Alignment.LEFT);
      // header.push('benchmark');
      header.push('candidate');
      header.push('suite');
      header.push('status');
    }
    const rows: string[][] = [header];
    for (const spec of specs) {
      const dateTime = DateTime.fromJSDate(spec.createdAt!);
      const formattedDate = dateTime.toFormat('y-LL-dd TTT');

      const row: string[] = [spec.name, spec.author, formattedDate];
      if (type === 'run') {
        // row.push((spec as IRun).benchmark.name);
        row.push((spec as IRun).candidate.name);
        row.push((spec as IRun).suite.name);
        row.push((spec as IRun).status);
      }
      rows.push(row);
    }

    for (const row of formatTable(alignments, rows)) {
      console.log(row);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Results
//
///////////////////////////////////////////////////////////////////////////////
async function results(benchmark: string, suite: string) {
  const results = await (await getLabClient()).allRunResults(benchmark, suite);

  if (results.length === 0) {
    console.log(`No matching results`);
  } else {
    const columns = new Set<string>();
    for (const result of results) {
      for (const key in result.measures) {
        if (!result.measures.hasOwnProperty(key)) continue;
        columns.add(key);
      }
    }

    const alignments: Alignment[] = [
      Alignment.LEFT,
      Alignment.LEFT,
      Alignment.LEFT,
    ];
    const header: string[] = ['run', 'submitter', 'date'];
    const rows: string[][] = [];
    for (const c of columns.values()) {
      alignments.push(Alignment.RIGHT);
      header.push(c);
    }
    rows.push(header);

    for (const result of results) {
      const row: string[] = [];
      row.push(result.name);
      row.push(result.author);
      const dateTime = DateTime.fromJSDate(result.createdAt!);
      row.push(dateTime.toFormat('y-LL-dd TTT'));
      for (const c of columns.values()) {
        const value = result.measures[c];
        if (value) {
          row.push(value + '');
        } else {
          row.push('---');
        }
      }
      rows.push(row);
    }

    for (const row of formatTable(alignments, rows)) {
      console.log(row);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Run
//
///////////////////////////////////////////////////////////////////////////////
async function run(candidate: string, suite: string) {
  const run = await (await getLabClient()).createRunRequest({
    candidate,
    suite,
  });
  console.log(`Scheduling run ${run.name}`);
}

///////////////////////////////////////////////////////////////////////////////
//
// Show
//
///////////////////////////////////////////////////////////////////////////////
async function show(type: string, name?: string) {
  await dispatch(type, ['benchmark', 'candidate', 'run', 'suite'], showHelper, [
    name,
  ]);
}

async function showHelper<T>(ops: ISpecOps<T>, name?: string) {
  if (name) {
    const spec = await ops.one(name);
    console.log(ops.format(spec));
  } else {
    const specs = await ops.all();
    if (specs.length > 0) {
      for (const spec of specs) {
        console.log(ops.format(spec));
      }
    } else {
      console.log(`No matching ${ops.name()}`);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Helpers
//
///////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line: interface-name
interface ISpecOps<T> {
  name(): string;
  load(specFile: string): T;
  format(spec: T): string;
  all(): Promise<T[]>;
  one(name: string): Promise<T>;
  upsert(spec: T, name?: string): Promise<void>;
}

const benchmarkOps: ISpecOps<IBenchmark> = {
  name: () => 'benchmark',
  load: (specFile: string) => load(BenchmarkType, specFile),
  format: (spec: IBenchmark) => formatSpec(spec),
  all: async () => (await getLabClient()).allBenchmarks(),
  one: async (name: string) => (await getLabClient()).oneBenchmark(name),
  upsert: async (spec: IBenchmark, name?: string) =>
    (await getLabClient()).upsertBenchmark(spec, name),
};

const candidateOps: ISpecOps<ICandidate> = {
  name: () => 'candidate',
  load: (specFile: string) => load(CandidateType, specFile),
  format: (spec: ICandidate) => formatSpec(spec),
  all: async () => (await getLabClient()).allCandidates(),
  one: async (name: string) => (await getLabClient()).oneCandidate(name),
  upsert: async (spec: ICandidate, name?: string) =>
    (await getLabClient()).upsertCandidate(spec, name),
};

const suiteOps: ISpecOps<ISuite> = {
  name: () => 'suite',
  load: (specFile: string) => load(SuiteType, specFile),
  format: (spec: ISuite) => formatSpec(spec),
  all: async () => (await getLabClient()).allSuites(),
  one: async (name: string) => (await getLabClient()).oneSuite(name),
  upsert: async (spec: ISuite, name?: string) =>
    (await getLabClient()).upsertSuite(spec, name),
};

const runOps: ISpecOps<IRun> = {
  name: () => 'run',
  load: (specFile: string) => {
    throw new IllegalOperationError(`Load operation not supported for IRun.`);
  },
  format: (spec: IRun) => formatSpec(spec),
  all: async () => (await getLabClient()).allRuns(),
  one: async (name: string) => (await getLabClient()).oneRun(name),
  upsert: (spec: IRun, name?: string) => {
    throw new IllegalOperationError(`Upsert operation not supported for IRun.`);
  },
};

// tslint:disable-next-line: no-any
async function dispatch<FUNCTION extends Function, PARAMS extends any[]>(
  rawType: string,
  legalTypes: string[],
  f: FUNCTION,
  p: PARAMS
) {
  const type = rawType.toLowerCase();
  if (!legalTypes.includes(type)) {
    const message = `Invalid entity "${type}". Expected ${formatChoices(
      legalTypes
    )}.`;
    throw new IllegalOperationError(message);
  } else {
    switch (type.toLowerCase()) {
      case 'benchmark':
        await f.apply(null, [benchmarkOps, ...p]);
        break;
      case 'candidate':
        await f.apply(null, [candidateOps, ...p]);
        break;
      case 'run':
        await f.apply(null, [runOps, ...p]);
        break;
      case 'suite':
        await f.apply(null, [suiteOps, ...p]);
        break;
      default:
        const message = `Invalid entity "${type}". Expected ${formatChoices(
          legalTypes
        )}.`;
        throw new IllegalOperationError(message);
    }
  }
}

function load<I, A>(decoder: Decoder<I, A>, specFile: string): A {
  const yamlText = fs.readFileSync(specFile, 'utf8');
  const spec = yaml.safeLoad(yamlText);
  return validate(decoder, spec);
}

function formatSpec(spec: object) {
  return yaml.safeDump(spec, {});
}

main(process.argv);
