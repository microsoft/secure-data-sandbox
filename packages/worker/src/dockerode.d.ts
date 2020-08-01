/**
 * @types/dockerode targets dockerode 2.5, which is an old release
 *
 * This file contains type patches to enable usage of Docker API fields that
 * are relevant to launching containers.
 *
 * Current Docker API docs: https://docs.docker.com/engine/api/latest
 */

import * as Dockerode from 'dockerode';

declare module 'dockerode' {
  interface HostConfig {
    NanoCpus?: number;
  }
}
