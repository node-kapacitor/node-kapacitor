import { RequestOptions } from 'https';
import * as url from 'url';

import * as b from './builder';
import * as grammar from './grammar';
import { IPingStats, IPoolOptions, Pool } from './pool';
import { assertNoErrors, IResults} from './results';
import { coerceBadly, ISchemaOptions, Schema } from './schema';

const defaultHost: IHostConfig = Object.freeze({
  host: '127.0.0.1',
  port: 9092,
  protocol: <'http'> 'http',
});

export * from './builder';
export { INanoDate, FieldType, Precision, Raw, TimePrecision, escape, toNanoDate, ITask } from './grammar';
export { ISchemaOptions } from './schema';
export { IPingStats, IPoolOptions } from './pool';
export { IResults, IResponse, ResultError } from './results';

export interface IHostConfig {

  /**
   * Influx host to connect to, defaults to 127.0.0.1.
   */
  host: string;
  /**
   * Influx port to connect to, defaults to 8086.
   */
  port?: number;
  /**
   * Protocol to connect over, defaults to 'http'.
   */
  protocol?: 'http' | 'https';

  /**
   * Optional request option overrides.
   */
  options?: RequestOptions;

}


export interface ISingleHostConfig extends IHostConfig {
  /**
   * Settings for the connection pool.
   */
  pool?: IPoolOptions;
}

export interface IClusterConfig {
  /**
   * A list of cluster hosts to connect to.
   */
  hosts: IHostConfig[];

  /**
   * Settings for the connection pool.
   */
  pool?: IPoolOptions;
}

/**
 * IRetentionOptions are passed into passed into the {@link
 * InfluxDB#createRetentionPolicy} and {@link InfluxDB#alterRetentionPolicy}.
 * See the [Downsampling and Retention page](https://docs.influxdata.com/
 * influxdb/v1.0/guides/downsampling_and_retention/) on the Influx docs for
 * more information.
 */
export interface IRetentionOptions {
  database?: string;
  duration: string;
  replication: number;
  isDefault?: boolean;
}

/**
 * Parses the URL out into into a IClusterConfig object
 */
function parseOptionsUrl(addr: string): ISingleHostConfig {
  const parsed = url.parse(addr);
  const options: ISingleHostConfig = {
    host: String(parsed.hostname),
    port: Number(parsed.port),
    protocol: <'http' | 'https'> String(parsed.protocol).slice(0, -1),
  };

  return options;
}

/**
 * Works similarly to Object.assign, but only overwrites
 * properties that resolve to undefined.
 */
function defaults<T>(target: any, ...srcs: any[]): T {
  srcs.forEach(src => {
    Object.keys(src).forEach(key => {
      if (target[key] === undefined) {
        target[key] = src[key];
      }
    });
  });

  return target;
}

/**
 * InfluxDB is the public interface to run queries against the your database.
 * This is a 'driver-level' module, not a a full-fleged ORM or ODM; you run
 * queries directly by calling methods on this class.
 *
 * Please check out some of [the tutorials](https://node-influx.github.io/manual/tutorial.html)
 * if you want help getting started!
 *
 * @example
 * const Influx = require('influx');
 * const influx = new Influx.InfluxDB({
 *  host: 'localhost',
 *  database: 'express_response_db',
 *  schema: [
 *    {
 *      measurement: 'response_times',
 *      fields: {
 *        path: Influx.FieldType.STRING,
 *        duration: Influx.FieldType.INTEGER
 *      },
 *      tags: [
 *        'host'
 *      ]
 *    }
 *  ]
 * })
 *
 * influx.writePoints([
 *   {
 *     measurement: 'response_times',
 *     tags: { host: os.hostname() },
 *     fields: { duration, path: req.path },
 *   }
 * ]).then(() => {
 *   return influx.query(`
 *     select * from response_times
 *     where host = ${Influx.escape.stringLit(os.hostname())}
 *     order by time desc
 *     limit 10
 *   `)
 * }).then(rows => {
 *   rows.forEach(row => console.log(`A request to ${row.path} took ${row.duration}ms`))
 * })
 */
export class Kapacitor {

  /**
   * Connect pool for making requests.
   * @private
   */
  private pool: Pool;

  /**
   * Config options for Kapacitor.
   * @private
   */
  private options: IClusterConfig;

  /**
   * Map of Schema instances defining measurements in Influx.
   * @private
   */
  private schema: { [db: string]: { [measurement: string]: Schema } } = Object.create(null);

  constructor(options: ISingleHostConfig);

  /**
   * Connect to an InfluxDB cluster by specifying a
   * set of connection options.
   */
  constructor(options: IClusterConfig);

  /**
   * Connect to an InfluxDB instance using a configuration URL.
   * @example
   * new InfluxDB('http://user:password@host:8086/database')
   */
  constructor(url: string);

  /**
   * Connects to a local, default Influx instance.
   */
  constructor();

  /**
   * Connect to a single InfluxDB instance by specifying
   * a set of connection options.
   * @param {IClusterConfig|ISingleHostConfig|string} [options='http://root:root@127.0.0.1:8086']
   *
   * @example
   * const Influx = require('influx')
   *
   * // Connect to a single host with a DSN:
   * const influx = new Influx.InfluxDB('http://user:password@host:8086/database')
   *
   * @example
   * const Influx = require('influx')
   *
   * // Connect to a single host with a full set of config details and
   * // a custom schema
   * const client = new Influx.InfluxDB({
   *   database: 'my_db',
   *   host: 'localhost',
   *   port: 8086,
   *   username: 'connor',
   *   password: 'pa$$w0rd',
   *   schema: [
   *     {
   *       measurement: 'perf',
   *       fields: {
   *         memory_usage: Influx.FieldType.INTEGER,
   *         cpu_usage: Influx.FieldType.FLOAT,
   *         is_online: Influx.FieldType.BOOLEAN
   *       }
   *       tags: [
   *         'hostname'
   *       ]
   *     }
   *   ]
   * })
   *
   * @example
   * const Influx = require('influx')
   *
   * // Use a pool of several host connections and balance queries across them:
   * const client = new Influx.InfluxDB({
   *   database: 'my_db',
   *   username: 'connor',
   *   password: 'pa$$w0rd',
   *   hosts: [
   *     { host: 'db1.example.com' },
   *     { host: 'db2.example.com' },
   *   ],
   *   schema: [
   *     {
   *       measurement: 'perf',
   *       fields: {
   *         memory_usage: Influx.FieldType.INTEGER,
   *         cpu_usage: Influx.FieldType.FLOAT,
   *         is_online: Influx.FieldType.BOOLEAN
   *       }
   *       tags: [
   *         'hostname'
   *       ]
   *     }
   *   ]
   * })
   *
   */
  constructor (options?: any) {
    // Figure out how to parse whatever we were passed in into a IClusterConfig.
    if (typeof options === 'string') { // plain URI => ISingleHostConfig
      options = parseOptionsUrl(options);
    } else if (!options) {
      options = defaultHost;
    }
    if (!options.hasOwnProperty('hosts')) { // ISingleHostConfig => IClusterConfig
      options = {
        database: options.database,
        hosts: [options],
        password: options.password,
        pool: options.pool,
        schema: options.schema,
        username: options.username,
      };
    }

    const resolved = <IClusterConfig> options;
    resolved.hosts = resolved.hosts.map(host => {
      return defaults({
        host: host.host,
        port: host.port,
        protocol: host.protocol,
        options: host.options,
      }, defaultHost);
    });
    
    this.pool = new Pool(resolved.pool);
    this.options = defaults(resolved, { hosts: [] });

    resolved.hosts.forEach(host => {
      this.pool.addHost(`${host.protocol}://${host.host}:${host.port}`, host.options);
    });
  }

  /**
   * Creates a new task.
   * @param {ITask} task
   * @return {Promise.<any>}
   * @example
   * kapacitor.createTask({
   *   id: 'test_kapa',
   *   type: 'stream',
   *   dbrps: [{ db: 'test', rp: 'autogen' }],
   *   script: 'stream\n    |from()\n        .measurement(\'tick\')\n',
   *   vars: {
   *     var1: {
   *       value: 42,
   *       type: 'float'
   *     }
   *   }
   * });
   */
  public createTask(task: grammar.ITask): Promise<any> {
    return this.pool.json(this.getRequestOpts({
      method: 'POST',
      path: 'tasks',
      body: JSON.stringify(task)
    })).then(assertNoErrors);
  }
  
  /**
   * drop a task with the provided task id.
   * @param {string} taskId
   * @return {Promise.<void>}
   * @example
   * kapacitor.dropTask('test_kapa');
   */
  public async dropTask(taskId: string): Promise<void> {
    const res = await this.pool.json(this.getRequestOpts({
      method: 'DELETE',
      path: 'tasks/' + taskId
    }));
    assertNoErrors(res);
  }
  
  /**
   * Returns array of tasks.
   * returns the results in a friendly format, {@link IResults}.
   * @param {String} [database] the database the measurement lives in, optional
   *     if a default database is provided.
   * @param {String|String[]} query
   * @param {IQueryOptions} [options]
   * @return {Promise<IResults|Results[]>} result(s)
   * @example
   * influx.query('select * from perf').then(results => {
   *   console.log(results)
   * })
   */
  public async getTasks(taskId: string): Promise<void> {
    const res = await this.pool.json(this.getRequestOpts({
      method: 'DELETE',
      path: 'tasks/' + taskId
    }));
    assertNoErrors(res);
  }

  
  /**
   * Creates options to be passed into the pool to request kapacitor.
   * @private
   */
  private getRequestOpts(opt: {
    method: string,
    path: string,
    body?: string,
    query?: string
  }): any {
    return {
      method: opt.method,
      path: url.resolve('/kapacitor/v1/', opt.path),
      body: opt.body,
      query: opt.query
    };
  }
}
