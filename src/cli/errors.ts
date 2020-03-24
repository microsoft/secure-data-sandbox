import { AxiosError } from 'axios';

export function decodeError(e: NodeJS.ErrnoException | AxiosError): string {
  // if (e.code) {
  //   switch (e.code) {
  //     case 'ENOTFOUND': {
  //       // tslint:disable-next-line:no-any
  //       const url = (e as any).config.url;
  //       // tslint:disable-next-line:no-any
  //       const method = (e as any).config.method;
  //       return `cannot ${method} ${url}`;
  //     }
  //     default:
  //     // Fall through
  //   }
  // }

  const axiosError = e as AxiosError;
  if (axiosError.isAxiosError) {
    const response = axiosError.response;
    if (response) {
      if (response.data.error) {
        return response.data.error.message;
      }
      return response.data;
    } else {
      if (e.code === 'ENOTFOUND') {
        const method = axiosError.config.method;
        const url = axiosError.config.url;
        return `cannot ${method} ${url}`;
      }
      // Fall through
    }
  }

  if (e.code === 'ENOENT') {
    // tslint:disable-next-line:no-any
    const message = `cannot open file ${(e as any).path}`;
    return message;
  }

  return e.message;
}
