import { DataType } from 'sequelize-typescript';

//
// Helper function provides a column decorator for readonly Date columns
// that are represented as string properties.
//
export function dateColumn(name: string) {
  return {
    type: DataType.DATE,
    get(): string {
      // tslint:disable-next-line:no-any
      const value = (this as any).getDataValue('createdAt') as Date;
      return value.toISOString();
    },
    set(date: string) {
      // Do nothing. This property is not writeable.
    },
  };
}

//
// Helper function provides a column decorator for JSON string columns
// that are represented as POJOs of type T.
//
export function jsonColumn<T>(name: string) {
  return {
    type: DataType.STRING,
    get(): T {
      // tslint:disable-next-line:no-any
      const value = (this as any).getDataValue(name) as string;
      // TODO: validate schema here.
      // Will likely need to pass in a schema parameter or
      // use some sort of global registry of schemas for types.
      return JSON.parse(value) as T;
    },
    set(value: T) {
      const text = JSON.stringify(value);
      // TODO: verify byte length of utf8 string
      // TODO: check sqlite errors on string too long
      // TODO: unit test for buffer overflow.
      // tslint:disable-next-line:no-any
      (this as any).setDataValue(name, text);
    },
  };
}
