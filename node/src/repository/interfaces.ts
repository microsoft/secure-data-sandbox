import { ColumnDescription } from '../cloud';

export interface SelectResults {
    columns: ColumnDescription[];
    // tslint:disable-next-line:no-any
    rows: any[][];
}

// tslint:disable-next-line:interface-name
export interface IRepository {
    initialize(): Promise<void>;

    selectFromCollection(collection: string): Promise<SelectResults>;
    selectFromResults(benchmarkId: string): Promise<SelectResults>;

    select(from: string): Promise<SelectResults>;
};
