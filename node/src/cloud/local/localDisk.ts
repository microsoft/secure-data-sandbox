import * as fs from 'fs';
import * as path from 'path';

import { BlobCreateHandler, IStorage } from '../interfaces';

export class LocalDisk implements IStorage {
  private root: string;

  constructor(root: string) {
    this.root = path.normalize(root);
    // console.log(`root = "${this.root}"`);
  }

  async appendBlob(name: string, buffer: Buffer): Promise<void> {
    // TODO: implement
    const message = 'LocalDisk: appendBlob() not implemented';
    throw new TypeError(message);
  }

  async writeBlob(
    name: string,
    buffer: Buffer,
    allowOverwrite: boolean
  ): Promise<void> {
    // TODO: implement
    const message = 'LocalDisk: writeBlob() not implemented';
    throw new TypeError(message);
  }

  async readBlob(name: string): Promise<Buffer> {
    const fullpath = path.join(this.root, name);
    return fs.readFileSync(fullpath);
  }

  async listBlobs(prefix = ''): Promise<string[]> {
    // TODO: May want to modify this to a recursive directory walk.
    const translated = this.translatePath(prefix);
    if (fs.existsSync(translated)) {
      return [...fs.readdirSync(this.translatePath(prefix))];
    } else {
      // TODO: change API to distinguish between path not found and empty directory.
      return [];
    }
  }

  async onBlobCreate(handler: BlobCreateHandler): Promise<void> {
    const message = 'LocalDisk.onBlobCreate: not implemented.';
    throw new TypeError(message);
  }

  private translatePath(localPath: string) {
    const normalized = path.posix.resolve('/', path.posix.normalize(localPath));
    const relative = path.posix.relative('/', normalized);
    const resolved = path.resolve(this.root, relative);
    const fullPath = path.normalize(resolved);
    // console.log();
    // console.log(`localPath = ${localPath}`);
    // console.log(`normalized = ${normalized}`);
    // console.log(`relative = ${relative}`);
    // console.log(`resolved = ${resolved}`);
    // console.log(`fullpath=${fullPath}`);
    return fullPath;
  }
}

// TODO: Save for unit tests **********************************************
// function go() {
//     const disk = new LocalDisk('/Users/mike/git/temp');

//     disk.translatePath('../a');
//     disk.translatePath('/a');
//     disk.translatePath('a');
//     disk.translatePath('a/b');
//     disk.translatePath('c:\\temp\\foo');
// }
