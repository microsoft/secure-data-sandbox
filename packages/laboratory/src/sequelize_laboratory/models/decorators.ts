import { DataType } from 'sequelize-typescript';

import { ValidationError } from '@microsoft/sds';
//
// Helper function provides a column decorator for JSON string columns
// that are represented as POJOs of type T.
//
export function jsonColumn<T>(name: string, length: number) {
  return {
    type: DataType.STRING(length),
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
      const buffer = Buffer.from(text, 'utf8');

      // TODO: check sqlite errors on string too long

      // Verify byte length of utf8 string fits in database field.
      // Use >= to account for potential trailing \0.
      if (buffer.byteLength >= length) {
        const message = `serialized text too long in json column "${name}". ${
          buffer.byteLength + 1
        } exceeds limit of ${length}.`;
        throw new ValidationError(message);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).setDataValue(name, text);
    },
  };
}
