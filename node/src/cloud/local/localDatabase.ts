import { ColumnDescription, IDatabase } from '../interfaces';

class LocalTable {
  private name: string;
  private columns: ColumnDescription[];
  private rows: string[][] = [];

  constructor(name: string, columns: ColumnDescription[]) {
    this.name = name;
    this.columns = columns;
  }

  getName(): string {
    return this.name;
  }

  getColumns(): ColumnDescription[] {
    return this.columns;
  }

  select(): string[][] {
    return this.rows;
  }

  // TODO: primary key? uniqueness?
  insert(row: string[]): void {
    if (row.length !== this.columns.length) {
      const message = `LocalTable:.insert(): expected ${this.columns.length} columns`;
      throw new TypeError(message);
    }
    // TODO: check column types before insert
    this.rows.push(row);
  }
}

export class LocalDatabase implements IDatabase {
  private tables = new Map<string, LocalTable>();

  async createTable(name: string, columns: ColumnDescription[]): Promise<void> {
    if (this.tables.has(name)) {
      const message = `LocalTableSet.createTable(): duplicate table name "${name}"`;
      throw new TypeError(message);
    }

    this.tables.set(name, new LocalTable(name, columns));
  }

  async ensureTable(name: string, columns: ColumnDescription[]): Promise<void> {
    if (!this.tables.has(name)) {
      await this.createTable(name, columns);
    }
  }

  async getTables(): Promise<string[]> {
    return [...this.tables.keys()];
  }

  // tslint:disable-next-line:no-any
  async insert(into: string, values: any[]): Promise<void> {
    const table = this.getTable(into);
    table.insert(values);
  }

  // tslint:disable-next-line:no-any
  async select(from: string): Promise<any[]> {
    const table = this.getTable(from);
    return table.select();
  }

  async getColumns(from: string): Promise<ColumnDescription[]> {
    const table = this.getTable(from);
    return table.getColumns();
  }

  private getTable(name: string): LocalTable {
    const table = this.tables.get(name);
    if (table === undefined) {
      const message = `LocalTableSet.getTable(): unknown table "${name}"`;
      throw new TypeError(message);
    }
    return table;
  }
}
