import { ILogger, IStorage } from '../interfaces';

export class BlobLogger implements ILogger {
  private storage: IStorage;
  private hostname: string;
  private blob: string;

  constructor(storage: IStorage, hostname: string, blob: string) {
    this.storage = storage;
    this.hostname = hostname;
    this.blob = blob;
  }

  async log(message: string): Promise<void> {
    const line = `${this.hostname}: ${message}\n`;
    this.storage.appendBlob(this.blob, Buffer.from(line, 'utf8'));
  }
}
