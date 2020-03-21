export function decodeError(e: NodeJS.ErrnoException): string {
  if (e.code) {
    switch (e.code) {
      case 'ENOTFOUND': {
        // tslint:disable-next-line:no-any
        const url = (e as any).config.url;
        // tslint:disable-next-line:no-any
        const method = (e as any).config.method;
        return `cannot ${method} ${url}`;
      }
      default:
      // Fall through
    }
  }
  return e.message;
}
