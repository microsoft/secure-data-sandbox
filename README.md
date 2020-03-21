# Data Contest Toolkit ![.github/workflows/dct-ci.yml](https://github.com/microsoft/data-contest-toolkit/workflows/.github/workflows/dct-ci.yml/badge.svg)

**`DCT` IS UNDER CONSTRUCTION AND NOT USABLE AT THIS POINT.
THIS PAGE WILL BE UPDATED AS FUNCTIONALITY BECOMES AVAILABLE.**

`DCT` is a secure execution environment for conducting machine learning trials against confidential data.

The goal of `DCT` is to enable collaboration between data scientists and organizations with interesting problems.
The challenge is that interesting problems come with interesting data sets that are almost always proprietary. These data sets are rich with trade secrets and personably identifiable information, and are usually encumbered by contracts, regulated by statute, and subject to corporate data stewardship policies.

In-house data science departments know how to work with this data, but the compliance issues make it is hard for them to collaborate with third parties and experts from industry and academia.

`DCT` aims to solve this problem by creating a sandbox for machine learning experiments inside the environment that hosts sensitive data.
With `DCT`, an organization can host machine learning challenges and invite third parties to submit solutions for evaluation against sensitive data that would otherwise be unavailable.

## Try DCT

### Building DCT
`DCT` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `DCT` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`DCT` has been tested with Node version [13.7.0](https://nodejs.org/download/release/v13.7.0/).

Here are the steps for cloning and building `DCT`:
~~~
% git clone https://github.com/microsoft/data-contest-toolkit.git
% npm install
% npm run compile
~~~

### Running DCT Locally
Now that we've built `DCT`, let's run a local instance of the Laboratory service.
This local instance does not have a worker pool, so it won't be able to actually run tests, but it allows you to get a feel for the CLI commands. Note that the local instance does not run in a secure environment.

Open two shell windows. In the first window, start the laboratory service:
~~~
% node build/src/laboratory/server/main.js
~~~

We can run the CLI run the second shell window. Let's start with the `--help` command:
~~~
% node build/src/cli/dct.js --help

Usage: dct [options] [command]

Data Contest Toolkit CLI

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  connect <server>             PARTIALLY IMPLEMENTED. Connect to a Laboratory service.
  create <type> <spec>         Create a benchmark, candidate, or suite from a specification where <type> is either "benchmark",
                               "candidate", or "suite".
  demo                         Configures Laboratory service with demo data.
  deploy <server>              NOT YET IMPLEMENTED. Deploy a Laboratory service.
  examples                     Show usage examples.
  list <type>                  Display summary information about benchmarks, candidates, runs, and suites.
  results <benchmark> <suite>  Display the results of all runs against a named benchmark and suite.
  run <candidate> <suite>      Run a named <candidate> against a named <suite>.
  show <type> [name]           Display all benchmarks, candidates, suites, or runs. If optional [name] is specified, only show
                               matching items.
  help [command]               display help for command

For more information and examples, see https://github.com/microsoft/data-contest-toolkit/README.md
~~~

The first thing we need to do is connect the CLI to the laboratory service that we just started. Currently the `build/src/laboratory/server/main.js` listens on port 3000 of localhost.
~~~
% node build/src/cli/dct.js connect localhost:3000

Connected to http://localhost:3000/
~~~
This writes the connection information to `~/.dct`, which is consulted every time the CLI is run. If you don't connect to a Laboratory, you will get the following error:
~~~
% node build/src/cli/dct.js list benchmark

Error: No laboratory connection. Use the "connect" command to specify a laboratory.
~~~

Now that we're connected to a Laboratory service,
we can use the `demo` command to populate the server with sample data, including
* A `benchmark`
* A `candidate`
* A `suite`
* Two `runs` with results.

~~~
% node build/src/cli/dct.js demo

=== Sample benchmark ===
name: benchmark1
author: author1
version: 0.0.1
pipelines:
  - mode: mode1
    stages:
      - {}
      - image: benchmark-image-mode1


=== Sample candidate ===
name: candidate1
author: author1
version: 0.0.1
benchmark: benchmark1
mode: mode1
image: candidate1-image


=== Sample suite ===
name: suite1
author: author1
version: 0.0.1
benchmark: benchmark1
mode: mode1


Initiated run f411c160-6bad-11ea-bd94-8fa64eaf2878
Initiated run f4156ae0-6bad-11ea-bd94-8fa64eaf2878
~~~

If we didn't want to use the built-in `demo` command, we could have created the benchmark, candidate, suite, and runs manually as follows:
~~~
% node build/src/cli/dct.js create benchmark sample-data/benchmark1.yaml
benchmark created

% node build/src/cli/dct.js create candidate sample-data/candidate1.yaml
candidate created

% node build/src/cli/dct.js create suite sample-data/suite1.yaml
suite created

% node build/src/cli/dct.js run candidate1 suite1
Scheduling run dfc8c5e0-6bae-11ea-bd94-8fa64eaf2878

% node build/src/cli/dct.js run candidate1 suite1
Scheduling run e152c140-6bae-11ea-bd94-8fa64eaf2878
~~~

The `demo` command does one thing we can't do through the CLI, and that is to pretend to be a worker and report status for the runs.

**List benchmarks, candidates, suites**

~~~
% node build/src/cli/dct.js list benchmark
name         submitter   date
benchmark1   author1     2020-03-19 14:37:31 PDT

% node build/src/cli/dct.js  list candidate
name         submitter   date
candidate1   author1     2020-03-19 14:37:31 PDT

% node build/src/cli/dct.js list suite
name     submitter   date
suite1   author1     2020-03-19 14:39:15 PDT
~~~

**Show benchmarks, candidates, suites**
~~~
% node build/src/cli/dct.js show benchmark benchmark1
pipelines:
  - mode: mode1
    stages:
      - {}
      - image: benchmark-image-mode1
id: 1
name: benchmark1
author: author1
version: 0.0.1
createdAt: 2020-03-19T21:37:31.437Z
updatedAt: 2020-03-21T20:00:04.907Z


% node build/src/cli/dct.js show candidate candidate1
id: 1
name: candidate1
author: author1
version: 0.0.1
benchmark: benchmark1
mode: mode1
image: candidate1-image
createdAt: 2020-03-19T21:37:31.452Z
updatedAt: 2020-03-21T20:00:37.772Z


% node build/src/cli/dct.js show suite suite1
id: 1
name: suite1
author: author1
version: 0.0.1
benchmark: benchmark1
mode: mode1
createdAt: 2020-03-19T21:39:15.634Z
updatedAt: 2020-03-21T20:00:48.302Z
~~~

**List runs**
~~~
% node build/src/cli/dct.js list run
name                                   submitter   date                     candidate    suite    status
f411c160-6bad-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 12:55:45 PDT  candidate1   suite1   completed
f4156ae0-6bad-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 12:55:45 PDT  candidate1   suite1   completed
dfc8c5e0-6bae-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 13:02:21 PDT  candidate1   suite1   created
e152c140-6bae-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 13:02:23 PDT  candidate1   suite1   created
~~~

**Displaying Run Results**
~~~
% node build/src/cli/dct.js results benchmark1 suite1

run                                    submitter   date                      passed   failed   skipped
f411c160-6bad-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 12:55:45 PDT        5        6       ---
f4156ae0-6bad-11ea-bd94-8fa64eaf2878   unknown     2020-03-21 12:55:45 PDT        3      ---         7
~~~

## Deploying DCT to the cloud
TODO: instructions for Azure deployment and client configuration.




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
