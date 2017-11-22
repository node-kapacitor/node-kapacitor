import * as http from 'http';

/**
 * A ResultError is thrown when a query generates errorful results from Kapacitor.
 */
export class ResultError extends Error {
  constructor(message: string) {
    super();
    this.message = `Error from Kapacitor: ${message}`;
  }
}

/**
 * An ServiceNotAvailableError is returned as an error from requests that
 * result in a > 500 error code.
 */
export class ServiceNotAvailableError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
    Object.setPrototypeOf(this, ServiceNotAvailableError.prototype);
  }
}

/**
 * An RequestError is returned as an error from requests that
 * result in a 300 <= error code <= 500.
 */
export class RequestError extends Error {
  statusCode: number;
  statusMessage: string;

  public static Create(
    req: http.ClientRequest,
    res: http.IncomingMessage,
    callback: (e: RequestError) => void,
  ) {
      let body = '';
      res.on('data', str => body = body + str.toString());
      res.on('end', () => callback(new RequestError(req, res, body)));
  }

  constructor(public req: http.ClientRequest, public res: http.IncomingMessage, body: string) {
    super();
    this.statusCode = <number>res.statusCode;
    this.statusMessage = <string>res.statusMessage;
    this.message = body;
    try { this.message = JSON.parse(body).error; } catch (e) {}
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

/**
 * KapacitorResults describes the result structure received from Kapacitor.
 */
export interface IResponse {
  error?: string;
}

/**
 * Checks if there are any errors in the IResponse and, if so, it throws them.
 * @private
 * @throws {ResultError}
 */
export function assertNoErrors(res: IResponse) {
  const { error } = res;
  if (error) {
    throw new ResultError(error);
  }

  return res;
}
