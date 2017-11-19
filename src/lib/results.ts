
/**
 * A ResultError is thrown when a query generates errorful results from Influx.
 */
export class ResultError extends Error {
  constructor(message: string) {
    super();
    this.message = `Error from InfluxDB: ${message}`;
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
