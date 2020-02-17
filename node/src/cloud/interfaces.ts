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
