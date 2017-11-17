
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

export type Tags = { [name: string]: string };

export type Row = any;

export interface IResponseSeries {
  name?: string;
  columns: string[];
  tags?: Tags;
  values?: Row[];
}
/**
 * IResultsParser is a user-friendly results tables from raw Influx responses.
 */
export interface IResults<T> extends Array<T> {
  /**
   * Group looks for and returns the first group in the results
   * that matches the provided tags.
   *
   * If you've used lodash or underscore, we do something quite similar to
   * their object matching: for every row in the results, if it contains tag
   * values matching the requested object, we return it.
   *
   * @param  {Object.<String, String>} matcher
   * @return {T[]}
   * @example
   * // Matching tags sets in queries:
   * influx.query('select * from perf group by host').then(results => {
   *   expect(results.group({ host: 'ares.peet.io'})).to.deep.equal([
   *     { host: 'ares.peet.io', cpu: 0.12, mem: 2435 },
   *     { host: 'ares.peet.io', cpu: 0.10, mem: 2451 },
   *     // ...
   *   ])
   *
   *   expect(results.group({ host: 'box1.example.com'})).to.deep.equal([
   *     { host: 'box1.example.com', cpu: 0.54, mem: 8420 },
   *     // ...
   *   ])
   * })
   */
  group(matcher: Tags): T[];

  /**
   * Returns the data grouped into nested arrays, similarly to how it was
   * returned from Influx originally.
   *
   * @returns {Array<{ name: String, tags: Object.<String, String>, rows: T[] }>
   * @example
   * influx.query('select * from perf group by host').then(results => {
   *   expect(results.groups()).to.deep.equal([
   *     {
   *       name: 'perf',
   *       tags: { host: 'ares.peet.io' },
   *       rows: [
   *         { host: 'ares.peet.io', cpu: 0.12, mem: 2435 },
   *         { host: 'ares.peet.io', cpu: 0.10, mem: 2451 },
   *         // ...
   *       ]
   *     }
   *     {
   *       name: 'perf',
   *       tags: { host: 'box1.example.com' },
   *       rows: [
   *         { host: 'box1.example.com', cpu: 0.54, mem: 8420 },
   *         // ...
   *       ]
   *     }
   *   ])
   * })
   */
  groups(): { name: string, tags: Tags, rows: T[] }[];
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
