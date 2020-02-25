// Workaround for Azure SDK Typescript errors related to fetch() api
// https://github.com/Azure/azure-sdk-for-js/issues/7462

interface Headers { }
interface Response { }
interface RequestInit { }
interface RequestInfo { }
