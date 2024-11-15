import fetch from 'node-fetch';
import { injectable } from 'tsyringe';
import {
  HttpRequestMethod,
  IMakeRequestOptions,
  IMakeRequestOptionsBase,
} from './http.models';

@injectable()
export class HttpService {
  get<T>(url: string, options?: IMakeRequestOptionsBase) {
    return this.submit<T>(HttpRequestMethod.Get, url, options);
  }

  post<T>(url: string, body: unknown, options: IMakeRequestOptionsBase = {}) {
    return this.submit<T>(HttpRequestMethod.Post, url, {
      body,
      ...options,
    });
  }

  patch<T>(url: string, body: unknown, options: IMakeRequestOptionsBase = {}) {
    return this.submit<T>(HttpRequestMethod.Patch, url, {
      body,
      ...options,
    });
  }

  delete<T>(url: string, options: IMakeRequestOptionsBase = {}) {
    return this.submit<T>(HttpRequestMethod.Delete, url, options);
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
