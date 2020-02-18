import { BlobCreateHandler, IStorage } from '../interfaces';

interface Blob {
  created: Date;
  owner: string;
  buffer: Buffer;
}

export class RamDisk implements IStorage {
  private blobs = new Map<string, Buffer>();
  private blobCreateHandlers: BlobCreateHandler[] = [];

  async appendBlob(name: string, buffer: Buffer): Promise<void> {
    const blob = this.blobs.get(name);
    if (blob === undefined) {
      await this.writeBlob(name, buffer, true);
    } else {
      // TODO: find more efficient way of appending.
      this.blobs.set(name, Buffer.concat([blob, buffer]));
    }
  }

  async writeBlob(
    name: string,
    buffer: Buffer,
    allowOverwrite: boolean
  ): Promise<void> {
    // TODO: copy buffer here?
    if (this.blobs.has(name) && !allowOverwrite) {
      const message = `Attempting to overwrite blob ${name}`;
      throw new TypeError(message);
    }
    this.blobs.set(name, buffer);
    for (const handler of this.blobCreateHandlers) {
      await handler(name);
    }
  }

  async readBlob(name: string): Promise<Buffer> {
    const buffer = this.blobs.get(name);
    if (buffer === undefined) {
      const message = `RamDisk: file ${name} not found.`;
      throw new TypeError(message);
    } else {
      return buffer;
    }
  }

  async listBlobs(prefix = ''): Promise<string[]> {
    const results: string[] = [];
    for (const name of this.blobs.keys()) {
      // console.log(`checking ${name}`);
      if (name.startsWith(prefix)) {
        results.push(name);
      }
    }
    return results;
  }

  async onBlobCreate(handler: BlobCreateHandler): Promise<void> {
    this.blobCreateHandlers.push(handler);
  }
}
