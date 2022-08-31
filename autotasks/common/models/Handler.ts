// Autotasks receive AutotaskRelayerParams when they are invoked by Defender,
// but we suggest you use the ApiRelayerParams when developing locally.
export type ApiRelayerParams = { apiKey: string; apiSecret: string };
export type AutotaskRelayerParams = { credentials: string; relayerARN: string };
export type RelayerParams = ApiRelayerParams | AutotaskRelayerParams;

// Webhook HTTP POST request
export type WebhookRequest = {
  body?: object;
  queryParameters?: { [name: string]: string };
  headers?: { [name: string]: string };
};

// Secret key/value pairs
export type Secrets = {
  [name: string]: string;
};

export type AutotaskEvent = RelayerParams & {
  secrets?: Secrets;
  request?: WebhookRequest;
};

export type Handler = (event: AutotaskEvent) => Promise<object | undefined>;

export type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
};
