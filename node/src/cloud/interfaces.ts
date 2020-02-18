// TODO: exception types for
//   blob not found
//   attempt to overwrite blob that already exists

export type BlobCreateHandler = (blob: string) => Promise<void>;

// tslint:disable-next-line:interface-name
export interface IStorage {
  // TODO: blob creation/update/delete events
  appendBlob(name: string, buffer: Buffer): Promise<void>;
  writeBlob(
    name: string,
    buffer: Buffer,
    allowOverwrite: boolean
  ): Promise<void>;
  readBlob(name: string): Promise<Buffer>;
  listBlobs(prefix?: string): Promise<string[]>;

  onBlobCreate(handler: BlobCreateHandler): Promise<void>;
}

// tslint:disable-next-line:interface-name
export interface IQueueStorage {
  enqueue(message: Buffer): Promise<void>;
}

// tslint:disable-next-line:interface-name
export interface IEnvironment {
  get(name: string): string;
  set(name: string, value: string): void;
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
}

// tslint:disable-next-line:interface-name
export interface ILogger {
  log: (message: string) => Promise<void>;
}

export interface ColumnDescription {
  name: string;
  type: string;
  // TODO: add caption?
}

// tslint:disable-next-line:interface-name
export interface IDatabase {
  ensureTable(name: string, columns: ColumnDescription[]): Promise<void>;

  // getTables(): Promise<string[]>;

  // tslint:disable-next-line:no-any
  insert(into: string, values: any[]): Promise<void>;

  // TODO: add simplified WHERE constraints
  // TODO: add simplified ORDER BY
  // tslint:disable-next-line:no-any
  select(from: string): Promise<any[]>;

  getColumns(from: string): Promise<ColumnDescription[]>;
}

export interface World {
  // hostname: string;
  // tagname: string;
  cloudStorage: IStorage;
  localStorage: IStorage;
  queueStorage: IQueueStorage;
  // orchestrator: IOrchestrator;
  environment: IEnvironment;
  logger: ILogger;
  // homedir: string;
  cwd: string;
}
