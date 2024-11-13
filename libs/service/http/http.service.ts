import fetch from 'node-fetch';
import { injectable } from 'tsyringe';
import {
  HttpRequestMethod,
  IMakeRequestOptions,
  IMakeRequestOptionsBase,
} from './http.models';

@injectable()
export class HttpService {
  get(url: string, options?: IMakeRequestOptionsBase) {
    return this.submit(HttpRequestMethod.Get, url, options);
  }

  post(url: string, body: unknown, options: IMakeRequestOptionsBase = {}) {
    return this.submit(HttpRequestMethod.Post, url, {
      body,
      ...options,
    });
  }

  patch(url: string, body: unknown, options: IMakeRequestOptionsBase = {}) {
    return this.submit(HttpRequestMethod.Patch, url, {
      body,
      ...options,
    });
  }

  delete(url: string, options: IMakeRequestOptionsBase = {}) {
    return this.submit(HttpRequestMethod.Delete, url, options);
  }

  private async submit<T>(
    method: HttpRequestMethod,
    url: string,
    { body, headers = {}, isJson = true }: IMakeRequestOptions = {},
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      ...(body ? { body: isJson ? JSON.stringify(body) : body } : {}),
      headers: {
        ...headers,
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      },
    });

    return isJson ? response.json() : response.body();
  }
}
