import { DataType } from 'sequelize-typescript';
//
// Helper function provides a column decorator for JSON string columns
// that are represented as POJOs of type T.
//
export function jsonColumn<T>(name: string) {
  return {
    // DataType.TEXT translates to VARCHAR(MAX) for MSSQL
    // https://github.com/sequelize/sequelize/blob/042cd693635ffba83ff7a2079974692af6f710a7/src/dialects/mssql/data-types.js#L91
    type: DataType.TEXT,
    get(): T | undefined {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (this as any).getDataValue(name) as string;
      // TODO: validate schema here.
      // Will likely need to pass in a schema parameter or
      // use some sort of global registry of schemas for types.

      // DESIGN NOTE: sequelize will attempt to get all columns, whether their
      // values are undefined or not. (e.g. in the case of an Update). Need to
      // handle undefined here.
      if (value) {
        return JSON.parse(value) as T;
      } else {
        return undefined;
      }
    },
    set(value: T) {
      const text = JSON.stringify(value);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).setDataValue(name, text);
    },
  };
}
