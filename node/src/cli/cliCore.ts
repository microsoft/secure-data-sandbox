import {
    // Environment,
    // IOrchestrator,
    IBlobStorage,
    // RamDisk,
    // Volume,
    World,
    // BlobLogger
} from '../cloud';

import { Laboratory, ILaboratory } from '../laboratory';
// import { encodeLog } from '../naming';

import {
  loadDescription,
  // loadLaboratory
} from '../laboratory';

import { getCollectionTable } from '../naming';

import {
  IRepository,
  SelectResults
} from '../repository';

export class CLI {
    // private orchestrator: IOrchestrator;
    private readonly cloudStorage: IBlobStorage;
    private readonly localStorage: IBlobStorage;

    private lab: ILaboratory | undefined;
    private repository: IRepository | undefined;

    constructor(world: World, lab: ILaboratory, repository: IRepository) {
      // this.orchestrator = world.orchestrator;
      this.cloudStorage = world.cloudStorage;
      this.localStorage = world.localStorage;

      this.lab = lab;
      this.repository = repository;
    }

    async deploy(
        specFile: string
    ): Promise<void> {
        //
        // The deploy functionality runs locally in the CLI application.
        //

        // TODO: implement
        throw new TypeError('Not imlemented');
        // const spec = await loadLaboratory(specFile, this.localStorage);
        // this.labHostname = spec.laboratory.host;
        // this.labPort = spec.laboratory.port;
        // this.deployLaboratory(spec.laboratory.host, spec.laboratory.port);

        // this.repositoryHostname = spec.repository.host;
        // this.repositoryPort = spec.repository.port;
        // this.deployRepository(spec.repository.host, spec.repository.port);
    }

    private async deployLaboratory(host: string, port: number) {
        //
        // The deploy functionality runs locally in the CLI application.
        //

        // TODO: implement
        throw new TypeError('Not imlemented');

        // console.log(`Depoying Laboratory to ${host}`);
        // console.log('Generating public/private key pair');
        // // TODO: generate keys here and store in CLI local store
        // // and in worker's attached volume.
        // // TODO: use naming library for blob.
        // // Two scenarios:
        // //   1. Standing up a new server with new keys
        // //   2. Restarting a server with existing keys
        // const keys = generateKeys();
        // const yamlText = yaml.safeDump(keys);
        // const secrets = new RamDisk();
        // secrets.writeBlob('keys', Buffer.from(yamlText, 'utf8'), true);
        // const volume: Volume = {
        //     mount: 'secrets',
        //     storage: secrets
        // };

        // // Create worker for Laboratory
        // this.orchestrator.createWorker(
        //     host,
        //     Laboratory.image.tag,
        //     this.cloudStorage,
        //     [volume],
        //     new Environment([['port', this.labPort!.toString()]]),
        //     new BlobLogger(this.cloudStorage, host, encodeLog(host))
        // );
    }

    private async deployRepository(host: string, port: number) {
        //
        // The deploy functionality runs locally in the CLI application.
        //

        // TODO: implement
        throw new TypeError('Not imlemented');

        // console.log(`Deploying Repository to ${host}`);

        // // Create worker for Repository
        // this.orchestrator.createWorker(
        //     host,
        //     Repository.image.tag,
        //     this.cloudStorage,
        //     [],
        //     new Environment([['port', this.repositoryPort!.toString()]]),
        //     new BlobLogger(this.cloudStorage, host, encodeLog(host))
        // );
    }

    async create(specFile: string): Promise<void> {
        //
        // Impemented as an RPC to the Lab service
        //
        const lab = await this.getLab();
        const spec = await loadDescription(specFile, this.localStorage);
        const destination = await lab.create(spec);
        console.log(`Uploaded to ${destination}`);
    }

    async list(collection: string): Promise<SelectResults> {
        //
        // Impemented as an RPC to the Repository service
        //
        const repository = await this.getRepository();
        
        // TODO: catch bad collection name
        return repository.select(getCollectionTable(collection));
    }

    async results(benchmarkId: string): Promise<SelectResults> {
        //
        // Impemented as an RPC to the Repository service
        //
        const repository = await this.getRepository();

        try {
            return await repository.selectFromResults(benchmarkId);
        } catch (e) {
            const message = `Unable to find results for benchmark ${benchmarkId}`;
            throw new TypeError(message);
        }
    }

    async run(candidateId: string, suiteId: string): Promise<void> {
        //
        // Impemented as an RPC to the Lab service
        //
        const lab = await this.getLab();
        await lab.run(candidateId, suiteId);
    }

    async connect(spec: string) {
      // TODO: implement.
      // Load and validate spec.
      // Write to current connection.
      // Updates lab and repository.
    }

    private async getLab(): Promise<ILaboratory> {
        if (!this.lab) {
            const message = 'Not connected to a Labratory';
            throw new TypeError(message);
        }
        return this.lab;
    }

    private async getRepository(): Promise<IRepository> {
        if (!this.repository) {
            const message = 'Not connected to a Repository';
            throw new TypeError(message);
        }
        return this.repository;
    }
}
