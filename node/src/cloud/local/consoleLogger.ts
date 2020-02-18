import { ILogger } from '../interfaces';

export class ConsoleLogger implements ILogger {
  private hostname: string;

  constructor(hostname: string) {
    this.hostname = hostname;
  }

  async log(message: string): Promise<void> {
    console.log(`${this.hostname}: ${message}`);
  }
}
