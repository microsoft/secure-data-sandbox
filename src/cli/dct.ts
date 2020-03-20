import { Command } from 'commander';

import * as fs from 'fs';
import { Decoder } from 'io-ts';
import * as yaml from 'js-yaml';
import { DateTime } from 'luxon';
import * as path from 'path';

import {
  apiVersion,
  BenchmarkType,
  CandidateType,
  LaboratoryClient,
  validate,
  IBenchmark,
  ICandidate,
  IEntityBase,
  IRun,
  ISuite,
  SuiteType,
} from '../laboratory';

import { formatTable, Alignment } from './formatting';

// TODO: Top-level try/catch error reporter
// TODO: errors across the wire
// TODO: list runs should show status column, suite, candidate

const endpoint = 'http://localhost:3000';
const lab = new LaboratoryClient(endpoint);

function main2(argv: string[]) {
  const program = new Command();

  program.description('Data Contest Toolkit CLI');
  program.version(apiVersion);

  program
    .command('create <type> <spec>')
    .description(
      'Create a benchmark, candidate, or suite from a specification where <type> is either "benchmark", "candidate", or "suite".'
    )
    .action(create);

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

  program
    .command('examples')
    .description('Show usage examples.')
    .action(() => examples(argv));

  program.parse(argv);
}

function examples(argv: string[]) {
  const examples = [
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

  console.log(
    'For more information and examples, see https://github.com/microsoft/data-contest-toolkit.'
  );
  console.log();
  for (const row of formatTable(alignments, rows)) {
    console.log(row);
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Create
//
///////////////////////////////////////////////////////////////////////////////
async function create(type: string, spec: string) {
  console.log(`execute create command ${type} ${spec}`);
  await dispatch(type, ['benchmark', 'candidate', 'suite'], createHelper, [
    spec,
  ]);
}

async function createHelper<T>(ops: ISpecOps<T>, specFile: string) {
  const spec = ops.load(specFile);
  await ops.upsert(spec);
}

///////////////////////////////////////////////////////////////////////////////
//
// List
//
///////////////////////////////////////////////////////////////////////////////
async function list(type: string) {
  await dispatch(
    type,
    ['benchmark', 'candidate', 'run', 'suite'],
    listHelper,
    []
  );
}

async function listHelper<T extends IEntityBase>(ops: ISpecOps<T>) {
  const specs = await ops.all();

  const alignments: Alignment[] = [
    Alignment.LEFT,
    Alignment.LEFT,
    Alignment.LEFT,
  ];
  const rows: string[][] = [['name', 'submitter', 'date']];
  for (const spec of specs) {
    const dateTime = DateTime.fromJSDate(spec.createdAt!);
    const formattedDate = dateTime.toFormat('y-LL-dd TTT');

    rows.push([spec.name, spec.author, formattedDate]);
  }

  for (const row of formatTable(alignments, rows)) {
    console.log(row);
  }
}

///////////////////////////////////////////////////////////////////////////////
//
// Results
//
///////////////////////////////////////////////////////////////////////////////
async function results(benchmark: string, suite: string) {
  console.log(`execute results command ${benchmark} ${suite}`);
  const results = await lab.allRunResults(benchmark, suite);

  // TODO: format as table.
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

///////////////////////////////////////////////////////////////////////////////
//
// Run
//
///////////////////////////////////////////////////////////////////////////////
async function run(candidate: string, suite: string) {
  console.log(`execute run command ${candidate} ${suite}`);
  const run = await lab.createRunRequest({ candidate, suite });
  console.log(`Scheduling run ${run.name}`);
}

///////////////////////////////////////////////////////////////////////////////
//
// Show
//
///////////////////////////////////////////////////////////////////////////////
async function show(type: string, name?: string) {
  console.log(`execute show command ${type} ${name}`);
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
    for (const spec of specs) {
      console.log(ops.format(spec));
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
  load(specFile: string): T;
  format(spec: T): string;
  all(): Promise<T[]>;
  one(name: string): Promise<T>;
  upsert(spec: T, name?: string): Promise<void>;
}

const benchmarkOps: ISpecOps<IBenchmark> = {
  load: (specFile: string) => load(BenchmarkType, specFile),
  format: (spec: IBenchmark) => formatSpec(spec),
  all: () => lab.allBenchmarks(),
  one: (name: string) => lab.oneBenchmark(name),
  upsert: (spec: IBenchmark, name?: string) => lab.upsertBenchmark(spec, name),
};

const candidateOps: ISpecOps<ICandidate> = {
  load: (specFile: string) => load(CandidateType, specFile),
  format: (spec: ICandidate) => formatSpec(spec),
  all: () => lab.allCandidates(),
  one: (name: string) => lab.oneCandidate(name),
  upsert: (spec: ICandidate, name?: string) => lab.upsertCandidate(spec, name),
};

const suiteOps: ISpecOps<ISuite> = {
  load: (specFile: string) => load(SuiteType, specFile),
  format: (spec: ISuite) => formatSpec(spec),
  all: () => lab.allSuites(),
  one: (name: string) => lab.oneSuite(name),
  upsert: (spec: ISuite, name?: string) => lab.upsertSuite(spec, name),
};

const runOps: ISpecOps<IRun> = {
  load: (specFile: string) => {
    throw new TypeError(`Load operation not supported for IRun.`);
  },
  format: (spec: IRun) => formatSpec(spec),
  all: () => lab.allRuns(),
  one: (name: string) => lab.oneRun(name),
  upsert: (spec: IRun, name?: string) => {
    throw new TypeError(`Upsert operation not supported for IRun.`);
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
    const message = `Invalid entity "${type}"`;
    throw new TypeError(message);
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
        const message = `Invalid entity "${type}"`;
        throw new TypeError(message);
    }
  }
}

function load<I, A>(decoder: Decoder<I, A>, specFile: string) {
  const yamlText = fs.readFileSync(specFile, 'utf8');
  const spec = yaml.safeLoad(yamlText);
  return validate(decoder, spec);
}

function formatSpec(spec: object) {
  return yaml.safeDump(spec, {});
}

async function go() {
  // await create({type: 'benchmark', spec: 'c:\\temp\\benchmark1.yaml'});
  // await create({type: 'candidate', spec: 'c:\\temp\\candidate1.yaml'});
  // await create({type: 'suite', spec: 'c:\\temp\\suite1.yaml'});
  // await show({type: 'benchmark'});
  // await show({type: 'candidate'});
  // await show({type: 'suite'});
  // await run({candidate: 'candidate1', suite: 'suite1'});
  // await run({candidate: 'candidate1', suite: 'suite1'});
  // await list({ type: 'benchmark' });
  // await list({ type: 'run' });
  // await results({ benchmark: 'benchmark1', suite: 'suite1' });
  // await lab.reportRunResults('14b37f60-6a2a-11ea-bd94-8fa64eaf2878', {
  //   passed: 5,
  //   failed: 6,
  // });
  // await lab.reportRunResults('7984abd0-6a2a-11ea-bd94-8fa64eaf2878', {
  //   passed: 5,
  //   skipped: 7,
  // });
  // await results({ benchmark: 'benchmark1', suite: 'suite1' });
}

// go();

main2(process.argv);

/*

x dct create [benchmark|candidate|suite] spec.yaml
x dct show [benchmark|candidate|suite|run] [name]
x dct list [benchmark|candidate|suite|run]
x dct run candidate suite
x dct results benchmark suite
dct connect
dct deploy
dct demo

*/
