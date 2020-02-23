import { DataType } from 'sequelize-typescript';
import { canonicalName } from '../naming';

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
      // TODO: consider making a writable variant.
    },
  };
}

//
// Helper function provides a column decorator for JSON string columns
// that are represented as POJOs of type T.
//
export function jsonColumn<T>(name: string, length: number) {
  return {
    type: DataType.STRING(length),
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
      const buffer = Buffer.from(text, 'utf8');

      // TODO: check sqlite errors on string too long

      // Verify byte length of utf8 string fits in database field.
      // Use >= to account for potential trailing \0.
      if (buffer.byteLength >= length) {
        const message = `serialized text too long in json column "${name}". ${buffer.byteLength +
          1} exceeds limit of ${length}.`;
        throw new TypeError(message);
      }

      // tslint:disable-next-line:no-any
      (this as any).setDataValue(name, text);
    },
  };
}

//
// Helper function provides a column decorator for name columns, which
// canonicalize names on set.
//
// TODO: unit test.
export function nameColumn(name: string) {
  return {
    type: DataType.STRING,
    set(value: string) {
      const canonical = canonicalName(value);

      // tslint:disable-next-line:no-any
      (this as any).setDataValue(name, canonical);
    },
  };
}
