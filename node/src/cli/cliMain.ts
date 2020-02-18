import * as path from 'path';

import { World } from '../cloud';
import { formatSelectResults } from '../utilities';

import { CLI } from './cliCore';

interface CommandDescription {
  name: string;
  args: string[];
  description: string;
  command: (args: string[]) => Promise<number>;
}

const cliName = 'dct';

export class CLIMain {
  commands: CommandDescription[];

  cli: CLI;
  cwd: string;

  constructor(cli: CLI, world: World) {
    this.cli = cli;
    this.cwd = world.cwd;

    const context = this;
    this.commands = [
      {
        name: 'deploy',
        args: ['spec'],
        description: 'Deploy DCT services',
        command: context.deployCommand,
      },
      {
        name: 'create',
        args: ['spec'],
        description: 'Create benchmark, candidate or suite specified in <spec>',
        command: context.createCommand,
      },
      {
        name: 'run',
        args: ['candidateId', 'suiteId'],
        description: 'Run specified suite <suiteId> on candidate <candidateId>',
        command: context.runCommand,
      },
      {
        name: 'results',
        args: ['benchmarkId'],
        description: 'Print test run results for <benchmarkId>',
        command: context.resultsCommand,
      },
      {
        name: 'list',
        args: ['benchmarks|candidates|runs|suites'],
        description: 'List benchmarks, candidates, runs, or suites',
        command: context.listCommand,
      },
      {
        name: 'help',
        args: [],
        description: 'Print help message',
        command: context.helpCommand,
      },
    ];
  }

  async run(args: string[]): Promise<number> {
    if (args.length < 2) {
      this.usage();
      return 0;
    } else {
      const cmdText = args[1];
      for (const command of this.commands) {
        if (cmdText === command.name) {
          const cmdArgs = args.slice(2);
          if (cmdArgs.length === command.args.length) {
            try {
              return await command.command.call(this, cmdArgs);
            } catch (e) {
              if (e instanceof TypeError) {
                console.log(e.message);
                return 1;
              } else {
                throw e;
              }
            }
          } else {
            console.log(`Expected ${command.args.length} arguments:`);
            console.log(
              `  ${cliName} ${command.name} ${formatArgs(command.args)}`
            );
            return 1;
          }
        }
      }
      console.log(`${cliName}: unknown command '${cmdText}'`);
      return 1;
    }
  }

  private usage() {
    console.log(`Expected a sub-command:`);
    for (const command of this.commands) {
      console.log(`  ${command.name} ${formatArgs(command.args)}`);
    }
    console.log(`Type "${cliName} help" for more information.`);
  }

  private async deployCommand(args: string[]): Promise<number> {
    const [filename] = args;
    const p = fullPath(this.cwd, filename);
    console.log(`Deploying from ${p}.`);
    await this.cli.deploy(p);
    return 0;
  }

  private async createCommand(args: string[]): Promise<number> {
    const [manifest] = args;
    const normalized = fullPath(this.cwd, manifest);
    await this.cli.create(normalized);
    return 0;
  }

  private async listCommand(args: string[]): Promise<number> {
    const [container] = args;
    const results = await this.cli.list(container);
    for (const line of formatSelectResults(results)) {
      console.log(line);
    }
    return 0;
  }

  private async resultsCommand(args: string[]): Promise<number> {
    const [benchmarkId] = args;
    const results = await this.cli.results(benchmarkId);
    for (const line of formatSelectResults(results)) {
      console.log(line);
    }
    return 0;
  }

  private async runCommand(args: string[]): Promise<number> {
    const [candidateId, suiteId] = args;
    await this.cli.run(candidateId, suiteId);
    return 0;
  }

  private async helpCommand(args: string[]): Promise<number> {
    console.log(`Here are some ${cliName} commands:`);
    console.log();
    for (const command of this.commands) {
      console.log(`${cliName} ${command.name} ${formatArgs(command.args)}`);
      console.log(`  ${command.description}`);
      console.log();
    }
    return 0;
  }
}

function formatArgs(args: string[]) {
  return args.map(x => `<${x}>`).join(' ');
}

function fullPath(cwd: string, relative: string) {
  return path.posix.join(cwd, relative);
}
