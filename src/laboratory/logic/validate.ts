import { isLeft } from 'fp-ts/lib/Either';
import { Decoder } from 'io-ts';

export function validate<A, I>(decoder: Decoder<I, A>, data: I): A {
  const x = decoder.decode(data);
  if (isLeft(x)) {
    const message = `${decoder.name}: data does not conform to schema`;
    throw new TypeError(message);
  } else {
    return x.right;
  }
}
