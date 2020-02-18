import { IEnvironment } from '../interfaces';

export class Environment implements IEnvironment {
  private variables: Map<string, string>;

  constructor(values: Array<[string, string]> = []) {
    this.variables = new Map<string, string>(values);
  }

  get(name: string): string {
    const value = this.variables.get(name);

    // TODO: is it ok to return empty string when not found?
    // What does real env do?
    return value || '';
  }

  set(name: string, value: string): void {
    this.variables.set(name, value);
  }

  has(name: string): boolean {
    return this.variables.has(name);
  }

  *keys(): IterableIterator<string> {
    yield* this.variables.keys();
  }

  *values(): IterableIterator<string> {
    yield* this.variables.values();
  }

  *entries(): IterableIterator<[string, string]> {
    yield* this.variables.entries();
  }
}
