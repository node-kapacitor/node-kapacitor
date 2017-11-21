import { RequestOptions } from 'https';
import * as url from 'url';

import { ITask, IUpdateTask, ITaskOptions, ITasks, ITemplate, escape, camelToDash } from './grammar';
import { IListTasksOptions, ITemplateOptions, IListTemplatesOptions, ITemplates } from './grammar';
import { IPingStats, IPoolOptions, Pool } from './pool';
import { assertNoErrors, RequestError} from './results';

const defaultHost: IHostConfig = Object.freeze({
  host: '127.0.0.1',
  port: 9092,
  protocol: <'http'> 'http',
});

export * from  './grammar';
export { IPingStats, IPoolOptions } from './pool';
export { IResponse, ResultError } from './results';

export interface ConfigUpdateAction {
  /**
   * Set the value in the configuration overrides.
   */
  set?: {
    [Attr: string]: any
  },
  /**
   * Delete the value from the configuration overrides.
   */
  delete?: string[],
  /**
   * Add a new element to a list configuration section.
   */
  add?: {
    [Attr: string]: any
  },
  /**
   * Remove a previously added element from a list configuration section.
   */
  remove?: string[]
}

export interface IHostConfig {

  /**
   * Kapacitor host to connect to, defaults to 127.0.0.1.
   */
  host: string;
  /**
   * Kapacitor port to connect to, defaults to 9092.
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
 * Kapacitor is an open source framework for processing, monitoring,
 *  and alerting on time series data.</br>
 * This is a 'driver-level' module, not a a full-fleged ORM or ODM.</br>
 * you run queries directly by calling methods on this class.
 * @example
 * ```typescript
 *
 * import { Kapacitor } from 'kapacitor';
 * const kapacitor = new Kapacitor({
 *  host: 'localhost'
 * })
 *
 * kapacitor.getTasks().then(res => {
 *  console.log(JSON.stringify(res, null, 2));
 * })
 * ```
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
  private options: string | ISingleHostConfig | IClusterConfig;

  /**
   * Connect to a single Kapacitor instance by specifying
   * a set of connection options.
   * @param {string | ISingleHostConfig | IClusterConfig} [options='http://root:root@127.0.0.1:9092']
   *
   * @example
   * ```typescript
   *
   * import { Kapacitor } from 'kapacitor';
   *
   * // Connects to a local, default kapacitor instance.
   * new Kapacitor()
   * ```
   *
   * @example
   * ```typescript
   *
   * import { Kapacitor } from 'kapacitor';
   *
   * // Connect to a single host with a DSN:
   * new Kapacitor('http://user:password@host:9092/')
   * ```
   *
   * @example
   * ```typescript
   *
   * import { Kapacitor } from 'kapacitor';
   *
   * // Connect to a single host with a full set of config details
   * const client = new Kapacitor({
   *   host: 'localhost',
   *   port: 9092
   * })
   * ```
   *
   * @example
   * ```typescript
   *
   * import { Kapacitor } from 'kapacitor';
   *
   * // Use a pool of several host connections and balance queries across them:
   * const client = new Kapacitor({
   *   hosts: [
   *     { host: 'kapa1.example.com' },
   *     { host: 'kapa2.example.com' },
   *   ]
   * })
   * ```
   */
  constructor (options?: string | ISingleHostConfig | IClusterConfig) {
    // Figure out how to parse whatever we were passed in into a IClusterConfig.
    if (typeof options === 'string') { // plain URI => ISingleHostConfig
      options = parseOptionsUrl(options);
    } else if (!options) {
      options = defaultHost;
    }
    if (!options.hasOwnProperty('hosts')) { // ISingleHostConfig => IClusterConfig
      options = <IClusterConfig>{
        hosts: [options],
        pool: options.pool
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
   * Pings all available hosts, collecting online status and version info.
   * @param  {Number} timeout Given in milliseconds
   * @return {Promise<IPingStats[]>}
   * @example
   * ```typescript
   *
   * kapacitor.ping(5000).then(hosts => {
   *   hosts.forEach(host => {
   *     if (host.online) {
   *       console.log(`${host.url.host} responded in ${host.rtt}ms running ${host.version})`)
   *     } else {
   *       console.log(`${host.url.host} is offline :(`)
   *     }
   *   })
   * })
   * ```
   */
  public ping(timeout: number): Promise<IPingStats[]> {
    return this.pool.ping(timeout);
  }

  /**
   * Creates a new task.
   * @param {ITask} task
   * @return {Promise.<ITask>}
   * @example
   * ```typescript
   *
   * kapacitor.createTask({
   *   id: 'test_kapa',
   *   type: 'stream',
   *   dbrps: [{ db: 'test', rp: 'autogen' }],
   *   script: 'stream\n    |from()\n        .measurement("tick")\n',
   *   vars: {
   *     var1: {
   *       value: 42,
   *       type: 'float'
   *     }
   *   }
   * });
   * ```
   */
  public createTask(task: ITask): Promise<ITask> {
    if (task.script) {
      task.script = escape.quoted(task.script);
    }

    return this.pool.json(this.getRequestOpts({
      method: 'POST',
      path: 'tasks',
      body: JSON.stringify(task)
    })).then(assertNoErrors);
  }

  /**
   * Creates a new template.
   * @param {ITemplate} template
   * @return {Promise.<ITemplate>}
   * @throws no template exists
   * @example
   * ```typescript
   *
   * kapacitor.createTemplate({
   *   id: 'test_template',
   *   type: 'stream',
   *   script: `
   *     // Which measurement to consume
   *     var measurement string
   *     // Optional where filter
   *     var where_filter = lambda: TRUE
   *     // Optional list of group by dimensions
   *     var groups = [*]
   *     // Which field to process
   *     var field string
   *     // Warning criteria, has access to 'mean' field
   *     var warn lambda
   *     // Critical criteria, has access to 'mean' field
   *     var crit lambda
   *     // How much data to window
   *     var window = 5m
   *     // The slack channel for alerts
   *     var slack_channel = '#alerts'
   *
   *     stream
   *         |from()
   *             .measurement(measurement)
   *             .where(where_filter)
   *             .groupBy(groups)
   *         |window()
   *             .period(window)
   *             .every(window)
   *         |mean(field)
   *         |alert()
   *             .warn(warn)
   *             .crit(crit)
   *             .slack()
   *             .channel(slack_channel)
   *   `,
   *   vars: {
   *     var1: {
   *       value: 42,
   *       type: 'float'
   *     }
   *   }
   * });
   * ```
   */
  public createTemplate(template: ITemplate): Promise<ITemplate> {
    if (template.script) {
      template.script = escape.quoted(template.script);
    }

    return this.pool.json(this.getRequestOpts({
      method: 'POST',
      path: 'templates',
      body: JSON.stringify(template)
    })).then(assertNoErrors);
  }

  /**
   * Update a task with the provided task id.
   * @param {IUpdateTask} task
   * @return {Promise.<ITask>}
   * @example
   * ```typescript
   *
   * kapacitor.updateTask({
   *   id: 'test_kapa',
   *   status: 'enabled'
   * });
   * ```
   */
  public updateTask(task: IUpdateTask): Promise<ITask> {
    if (task.script) {
      task.script = escape.quoted(task.script);
    }
    const taskId = task.id;
    delete task.id;

    return this.pool.json(this.getRequestOpts({
      method: 'PATCH',
      path: 'tasks/' + taskId,
      body: JSON.stringify(task)
    })).then(assertNoErrors);
  }

  /**
   * Update a template with the provided template id.
   * @param {ITemplate} template
   * @return {Promise.<ITemplate>}
   * @example
   * ```typescript
   *
   * kapacitor.updateTemplate({
   *   id: 'test_template',
   *   vars: {
   *     var1: {
   *       value: 42,
   *       type: 'float'
   *     }
   *   }
   * });
   * ```
   */
  public updateTemplate(template: ITemplate): Promise<ITemplate> {
    if (template.script) {
      template.script = escape.quoted(template.script);
    }
    const templateId = template.id;
    delete template.id;

    return this.pool.json(this.getRequestOpts({
      method: 'PATCH',
      path: 'templates/' + templateId,
      body: JSON.stringify(template)
    })).then(assertNoErrors);
  }

  /**
   * remove a task with the provided task id.
   * @param {string} taskId
   * @return {Promise.<void>}
   * @example
   * ```typescript
   *
   * kapacitor.removeTask('test_kapa');
   * ```
   */
  public async removeTask(taskId: string): Promise<void> {
    const res = await this.pool.json(this.getRequestOpts({
      method: 'DELETE',
      path: 'tasks/' + taskId
    }));
    assertNoErrors(res);
  }

  /**
   * remove a template with the provided template id.
   * @param {string} templateId
   * @return {Promise.<void>}
   * @example
   * ```typescript
   *
   * kapacitor.removeTemplate('test_template');
   * ```
   */
  public async removeTemplate(templateId: string): Promise<void> {
    const res = await this.pool.json(this.getRequestOpts({
      method: 'DELETE',
      path: 'templates/' + templateId
    }));
    assertNoErrors(res);
  }

  /**
   * Return a task.
   * returns the results in a friendly format, {@link ITask}.
   * @param {String} taskId the task id.
   * @param {ITaskOptions} [query]
   * @return {Promise<ITask>} result
   * @throws {@link RequestError}
   * @example
   * ```typescript
   *
   * kapacitor.getTask(taskId, {dotView: 'labels'}).then(results => {
   *   console.log(results)
   * })
   * ```
   */
  public getTask(taskId: string, query?: ITaskOptions): Promise<ITask> {
    if (query) {
      query.dotView = query.dotView ? query.dotView : 'attributes';
      query.scriptFormat = query.scriptFormat ? query.scriptFormat : 'formatted';
    }
    return this.pool.json(this.getRequestOpts({
      path: 'tasks/' + taskId,
      query: query ? camelToDash(query) : undefined
    })).then(assertNoErrors);
  }

  /**
   * Return a template.
   * returns the results in a friendly format, {@link ITemplate}.
   * @param {String} templateId the template id.
   * @param {ITemplateOptions} [query]
   * @return {Promise<ITemplate]>} result(s)
   * @throws {@link RequestError}
   * @example
   * ```typescript
   *
   * kapacitor.getTemplate(tmplId, {scriptFormat: 'raw'}).then(results => {
   *   console.log(results)
   * })
   * ```
   */
  public getTemplate(templateId: string, query?: ITemplateOptions): Promise<ITemplate> {
    if (query) {
      query.scriptFormat = query.scriptFormat ? query.scriptFormat : 'formatted';
    }
    return this.pool.json(this.getRequestOpts({
      path: 'templates/' + templateId,
      query: query ? camelToDash(query) : undefined
    })).then(assertNoErrors);
  }

  /**
   * Return a array of tasks.
   * returns the results in a friendly format, {@link ITasks}.
   * @param {IListTasksOptions} [query]
   * @return {Promise<ITasks>} result(s)
   * @example
   * ```typescript
   *
   * kapacitor.getTasks({dotView: 'labels'}).then(results => {
   *   console.log(results)
   * })
   * ```
   */
  public getTasks(query?: IListTasksOptions): Promise<ITasks> {
    if (query) {
      query.dotView = query.dotView ? query.dotView : 'attributes';
      query.scriptFormat = query.scriptFormat ? query.scriptFormat : 'formatted';
      query.offset = query.offset ? query.offset : 0;
      query.limit = query.limit ? query.limit : 100;
    }
    return <Promise<ITasks>>this.pool.json(this.getRequestOpts({
      path: 'tasks',
      query: query ? camelToDash(query) : undefined
    })).then(assertNoErrors);
  }

  /**
   * Return a array of template.
   * returns the results in a friendly format, {@link ITemplates}.
   * @param {IListTemplatesOptions} [query]
   * @return {Promise<ITemplates>} result(s)
   * @example
   * ```typescript
   *
   * kapacitor.getTemplates({dotView: 'labels'}).then(results => {
   *   console.log(results)
   * })
   * ```
   */
  public getTemplates(query?: IListTemplatesOptions): Promise<ITemplates> {
    if (query) {
      query.scriptFormat = query.scriptFormat ? query.scriptFormat : 'formatted';
      query.offset = query.offset ? query.offset : 0;
      query.limit = query.limit ? query.limit : 100;
    }
    return <Promise<ITemplates>>this.pool.json(this.getRequestOpts({
      path: 'templates',
      query: query ? camelToDash(query) : undefined
    })).then(assertNoErrors);
  }

  /**
   * Update config.
   * @param {ConfigUpdateAction} action
   * @param {string} section
   * @param {string} [element]
   * @return {Promise.<void>}
   * @example
   * ```typescript
   *
   * kapacitor.updateConfig({
   *  set: {
   *    'disable-subscriptions' : !disableSubscriptions
   *  }
   * }, 'influxdb', 'default');
   * ```
   */
  public async updateConfig(action: ConfigUpdateAction, section: string, element?: string): Promise<void> {
    await this.pool.json(this.getRequestOpts({
      method: 'POST',
      path: 'config/' + section + (element ? '/' + element : ''),
      body: JSON.stringify(action)
    })).then(assertNoErrors);
  }
  /**
   * Get config.
   * @param {string} [section]
   * @param {string} [element]
   * @return {Promise<any>} result
   * @example
   * ```typescript
   *
   * kapacitor.getConfig('influxdb', 'default').then(results => {
   *   console.log(results)
   * })
   * ```
   */
  public getConfig(section?: string, element?: string): Promise<any> {
    const path = 'config' + (section ? '/' + section : '') + (element ? '/' + element : '')
    return this.pool.json(this.getRequestOpts({
      path
    })).then(assertNoErrors);
  }

  /**
   * Creates options to be passed into the pool to request kapacitor.
   * @private
   */
  private getRequestOpts(opt: {
    path: string,
    method?: string,
    body?: string,
    query?: string
  }): any {
    return Object.assign({
      method: 'GET'
    }, opt, {
      path: url.resolve('/kapacitor/v1/', opt.path)
    });
  }
}
