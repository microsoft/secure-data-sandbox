# Secure Data Sandbox ![.github/workflows/ci.yml](https://github.com/microsoft/secure-data-sandbox/workflows/.github/workflows/ci.yml/badge.svg)

**`SDS` IS UNDER CONSTRUCTION AND NOT USABLE AT THIS POINT.
THIS PAGE WILL BE UPDATED AS FUNCTIONALITY BECOMES AVAILABLE.**

`SDS` is a secure execution environment for conducting machine learning trials against confidential data.

The goal of `SDS` is to enable collaboration between data scientists and organizations with interesting problems.
The challenge is that interesting problems come with interesting data sets that are almost always proprietary. These data sets are rich with trade secrets and personably identifiable information, and are usually encumbered by contracts, regulated by statute, and subject to corporate data stewardship policies.

In-house data science departments know how to work with this data, but the compliance issues make it is hard for them to collaborate with third parties and experts from industry and academia.

`SDS` aims to solve this problem by creating a sandbox for machine learning experiments inside the environment that hosts sensitive data.
With `SDS`, an organization can host machine learning challenges and invite third parties to submit solutions for evaluation against sensitive data that would otherwise be unavailable.

## Try SDS

### Building SDS
`SDS` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `SDS` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`SDS` has been tested with Node version [12.16.3](https://nodejs.org/download/release/v12.16.3/).

Here are the steps for cloning and building `SDS`:
~~~
% git clone https://github.com/microsoft/secure-data-sandbox.git
% npm install
% npm run compile
~~~

### Running SDS Locally
Now that we've built `SDS`, let's run a local instance of the Laboratory service.
This local instance does not have a worker pool, so it won't be able to actually run tests, but it allows you to get a feel for the CLI commands. Note that the local instance does not run in a secure environment.

Open two shell windows. In the first window, start the laboratory service:
~~~
% npm run laboratory
~~~

We can run the CLI run the second shell window. Let's start with the `help` command:
~~~
% npm run cli help

Usage: sds [options] [command]

Secure Data Sandbox CLI

Options:
  -h, --help                   display help for command

Commands:
  connect [service]            Connect to a Laboratory [service] or print connection info.
  create <type> <spec>         Create a benchmark, candidate, or suite from a specification where <type> is either "benchmark", "candidate", or
                               "suite".
  demo                         Configures Laboratory service with demo data.
  deploy <server>              NOT YET IMPLEMENTED. Deploy a Laboratory service.
  examples                     Show usage examples.
  list <type>                  Display summary information about benchmarks, candidates, runs, and suites.
  results <benchmark> <suite>  Display the results of all runs against a named benchmark and suite.
  run <candidate> <suite>      Run a named <candidate> against a named <suite>.
  show <type> [name]           Display all benchmarks, candidates, suites, or runs. If optional [name] is specified, only show matching items.
  help [command]               display help for command

For more information and examples, see https://github.com/microsoft/secure-data-sandbox/blob/main/laboratory/README.md
~~~

The first thing we need to do is connect the CLI to the laboratory service that we just started. Currently `packages/laboratory/dist/main.js` listens on port 3000 of localhost.
~~~
% npm run cli connect http://localhost:3000

Connected to http://localhost:3000/.
~~~
This writes the connection information to `~/.sds`, which is consulted every time the CLI is run. If you don't connect to a Laboratory, you will get the following error:
~~~
% npm run cli list benchmark

Error: No laboratory connection. Use the "connect" command to specify a laboratory.
~~~

Now that we're connected to a Laboratory service,
we can use the `demo` command to populate the server with sample data, including
* A `benchmark`
* A `candidate`
* A `suite`
* Two `runs` with results.

~~~
% npm run cli demo

=== Sample benchmark ===
name: benchmark1
author: author1
apiVersion: v1alpha1
stages:
  - name: candidate
    kind: candidate
    volumes:
      - name: training
        path: /input
  - name: scoring
    image: benchmark-image
    kind: container
    volumes:
      - name: reference
        path: /reference


=== Sample candidate ===
name: candidate1
author: author1
apiVersion: v1alpha1
benchmark: benchmark1
image: candidate1-image


=== Sample suite ===
name: suite1
author: author1
apiVersion: v1alpha1
benchmark: benchmark1
volumes:
  - name: training
    type: AzureBlob
    target: 'https://sample.blob.core.windows.net/training'
  - name: reference
    type: AzureBlob
    target: 'https://sample.blob.core.windows.net/reference'


Initiated run 0db6c510-d059-11ea-ab64-31e44163fc86
Initiated run 0dba4780-d059-11ea-ab64-31e44163fc86
~~~

If we didn't want to use the built-in `demo` command, we could have created the benchmark, candidate, suite, and runs manually as follows:
~~~
% npm run cli create benchmark sample-data/benchmark1.yaml
benchmark created

% npm run cli create candidate sample-data/candidate1.yaml
candidate created

% npm run cli create suite sample-data/suite1.yaml
suite created

% npm run cli run candidate1 suite1
Scheduling run 1dae9970-d059-11ea-ab64-31e44163fc86

% npm run cli run candidate1 suite1
Scheduling run 1fbe1880-d059-11ea-ab64-31e44163fc86
~~~

The `demo` command does one thing we can't do through the CLI, and that is to pretend to be a worker and report status for the runs.

**List benchmarks, candidates, suites**

~~~
% npm run cli list benchmark
name         submitter   date
benchmark1   author1     2020-07-27 22:32:28 UTC

% npm run cli list candidate
name         submitter   date  
candidate1   author1     2020-07-27 22:32:28 UTC

% npm run cli list suite
name     submitter   date
suite1   author1     2020-07-27 22:32:28 UTC
~~~

**Show benchmarks, candidates, suites**
~~~
% npm run cli show benchmark benchmark1
stages:
  - name: candidate
    kind: candidate
    volumes:
      - name: training
        path: /input
  - name: scoring
    kind: container
    image: benchmark-image
    volumes:
      - name: reference
        path: /reference
name: benchmark1
author: author1
apiVersion: v1alpha1
createdAt: 2020-07-27T22:32:28.865Z
updatedAt: 2020-07-27T22:32:43.284Z


% npm run cli show candidate candidate1
name: candidate1
author: author1
apiVersion: v1alpha1
benchmark: benchmark1
image: candidate1-image
createdAt: 2020-07-27T22:32:28.883Z
updatedAt: 2020-07-27T22:32:47.384Z


% npm run cli show suite suite1
volumes:
  - name: training
    type: AzureBlob
    target: 'https://sample.blob.core.windows.net/training'
  - name: reference
    type: AzureBlob
    target: 'https://sample.blob.core.windows.net/reference'
name: suite1
author: author1
apiVersion: v1alpha1
benchmark: benchmark1
createdAt: 2020-07-27T22:32:28.889Z
updatedAt: 2020-07-27T22:32:50.623Z
~~~

**List runs**
~~~
% npm run cli list run
name                                   submitter   date                      candidate    suite    status   
0db6c510-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:28 UTC   candidate1   suite1   completed
0dba4780-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:28 UTC   candidate1   suite1   completed
1dae9970-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:55 UTC   candidate1   suite1   created  
1fbe1880-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:59 UTC   candidate1   suite1   created  
~~~

**Displaying Run Results**
~~~
% npm run cli results benchmark1 suite1

run                                    submitter   date                      passed   failed   skipped
0db6c510-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:28 UTC        5        6       ---
0dba4780-d059-11ea-ab64-31e44163fc86   unknown     2020-07-27 22:32:28 UTC        3      ---         7
~~~

## Deploying SDS to the cloud

TODO

## [Developer Guide](docs/development.md)

For developers looking to modify SDS itself, please refer to the [developer guide](docs/development.md)

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

