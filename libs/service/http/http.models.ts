export enum HttpRequestMethod {
  Get = 'GET',
  Post = 'POST',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export enum HttpResponseStatus {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  GatewayTimeout = 504,
}

export interface IMakeRequestOptionsBase {
  headers?: Record<string, string>;
  isJson?: boolean;
}

export interface IMakeRequestOptions extends IMakeRequestOptionsBase {
  body?: unknown;
}
