import { AxiosError } from 'axios';
import { URL } from 'url';

export function decodeError(e: NodeJS.ErrnoException | AxiosError): string {
  const axiosError = e as AxiosError;
  if (axiosError.isAxiosError) {
    const response = axiosError.response;
    if (response) {
      if (response.data && response.data.error) {
        // This case can be triggered by attempting to access a non-existant
        // benchmark, candidate, run, or suite.
        return response.status + ': ' + response.data.error.message;
      } else {
        // This case can be triggered by getting from a website like microsoft.com.
        const method = axiosError.config.method;
        const url = axiosError.config.url;
        return `${response.status}: cannot ${method} ${url}`;
      }
    } else {
      // We didn't even get a response.
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
    // Most likely file not found.
    // tslint:disable-next-line:no-any
    const message = `cannot open file "${(e as any).path}".`;
    return message;
  }

  // Some other type of error.
  return e.message;
}
