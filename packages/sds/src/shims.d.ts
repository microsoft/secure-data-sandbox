/* eslint-disable @typescript-eslint/no-empty-interface */

// @azure/storage-queue
// Workaround for Azure SDK Typescript errors related to fetch() api
// https://github.com/Azure/azure-sdk-for-js/issues/7462

interface Headers {}
interface Response {}
interface RequestInit {}
interface RequestInfo {}

// superagent
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/12044
declare interface XMLHttpRequest {}
