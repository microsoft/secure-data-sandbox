import { AxiosError } from 'axios';
import { URL } from 'url';

export function decodeError(e: NodeJS.ErrnoException | AxiosError): string {
  const axiosError = e as AxiosError;
  if (axiosError.isAxiosError) {
    const response = axiosError.response;
    if (response) {
      if (response.data.error) {
        return response.status + ': ' + response.data.error.message;
      }
      return response.data;
    } else {
      if (e.code === 'ENOTFOUND') {
        const method = axiosError.config.method;
        const url = axiosError.config.url;
        return `cannot ${method} ${url}`;
      } else if (e.code === 'ECONNREFUSED') {
        const url = new URL(axiosError.config.url!);
        const host = url.host;
        return `cannot connect to ${host}`;
      }
      // Fall through
    }
  }

  if (e.code === 'ENOENT') {
    // tslint:disable-next-line:no-any
    const message = `cannot open file "${(e as any).path}".`;
    return message;
  }

  return e.message;
}
