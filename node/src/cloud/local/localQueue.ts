import { IQueueStorage } from '../interfaces';

export class LocalQueue implements IQueueStorage {
  enqueue(message: Buffer): Promise<void> {
    // TODO: implement
    throw new Error('Method not implemented.');
  }
}
