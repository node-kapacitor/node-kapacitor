/**
 * FieldType is an enumeration of InfluxDB field data types.
 * @typedef {Number} FieldType
 * @example
 * import { FieldType } from 'influx'; // or const FieldType = require('influx').FieldType
 *
 * const schema = {
 *   measurement: 'my_measurement',
 *   fields: {
 *     my_int: FieldType.INTEGER,
 *     my_float: FieldType.FLOAT,
 *     my_string: FieldType.STRING,
 *     my_boolean: FieldType.BOOLEAN,
 *   }
 * }
 */
export enum FieldType {
  FLOAT,
  INTEGER,
  STRING,
  BOOLEAN,
}

export enum TemplateFields {
  link = 'link',
  id = 'id',
  type = 'type',
  script = 'script',
  dot = 'dot',
  error = 'error',
  created = 'created',
  modified = 'modified',
}

export enum TaskFields {
  link = 'link',
  id = 'id',
  type = 'type',
	dbrps = 'dbrps',
  script = 'script',
  dot = 'dot',
	status = 'status',
  executing = 'executing',
  error = 'error',
	stats = 'stats',
  created = 'created',
  modified = 'modified',
	lastEnabled = 'last-enabled',
	vars = 'vars',
}

export function isNumeric(value: string): boolean {
  return !Number.isNaN(Number(value));
}

/**
 * You can provide Raw values to Influx methods to prevent it from escaping
 * your provided string.
 * @class
 * @example
 * influx.createDatabase(new Influx.Raw('This won\'t be escaped!'));
 */
export class Raw {

  /**
   * Wraps a string so that it is not escaped in Influx queries.
   * @param {String} value
   * @example
   * influx.createDatabase(new Influx.Raw('This won\'t be escaped!'));
   */
  constructor(private value: string) {}

  /**
   * Returns the wrapped string.
   * @return {String}
   */
  public getValue(): string {
    return this.value;
  }
}

export interface ITemplate {
  /**
   * a link object with an href of the resource.Clients should not need to 
   * perform path manipulation in most cases and can use the links provided 
   * from previous calls.
   */
  readonly link?: {
    readonly ref: 'self';
    readonly herf: string;
  };
  
  /**
   * Unique identifier for the task. If empty a random ID will be chosen.
   */
  id?: string;
  
  /**
   * The task type:streamorbatch.
   */
  type?: 'stream'|'batch';
  
  /**
   * The content of the script.
   */
  script?: string;
  
  /**
   * A set of vars for overwriting any defined vars in the TICKscript.
   */
  vars?: any;
  
  /**
   * GraphViz DOT syntax formatted representation of the task DAG.
   */
  readonly dot?: string;
  
  /**
   * Any error encountered when executing the task.
   */
  readonly error?: string;

  /**
   * Date the task was first created.
   */
  readonly created?: Date | string | number;
  
  /**
   * Date the task was last modified.
   */
  readonly modified?: Date | string | number;
}

export interface ITask extends ITemplate {

  /**
   * An optional ID of a template to use instead of specifying a TICKscript 
   * and type directly.
   */
  templateId?: string;

  /**
   * List of database retention policy pairs the task is allowed to access.
   */
  dbrps?: {
      /**
       * Retention policy to query from, defaults to the DEFAULT
       * database policy.
       */
      rp?: string;
    
      /**
       * Database under which to query the points. This is required if a default
       * database is not provided in Influx.
       */
      db?: string;
  }[];

  /**
   * One ofenabled or disabled.
   */
  status?: 'enabled' | 'disabled';
  
  /**
   * Whether the task is currently executing.
   */
  readonly executing?: boolean;

  /**
   * Map of statistics about a task.
   */
  readonly stats?: any;

  /**
   * Date the task was last set to status enabled.
   */
  readonly lastEnabled?: Date | string | number;
}

export interface IUpdateTask extends ITask {
  id: string;
}

export interface ITasks {
  tasks: ITask[]
}

export interface ITaskOptions {
  /**
   * One of labels or attributes. Labels is less readable but will 
   * correctly render with all the information contained in labels.
   */
  dotView?: 'labels' | 'attributes';

  /**
   * One of formatted or raw. Raw will return the script identical to 
   * how it was defined. Formatted will first format the script.
   */
  scriptFormat?: 'formatted' | 'raw';

  /**
   * Optional ID of a running replay.The returned task information 
   * will be in the context of the task for the running replay.
   */
  replayId?: string;
}

export interface IListTasksOptions extends ITaskOptions {
  /**
   * Filter results based on the pattern.
   * Uses standard shell glob matching, 
   * see this@see <https://golang.org/pkg/path/filepath/#Match> for more details.
   */
  pattern?: string;

  /**
   * List of fields to return. If empty returns all fields. 
   * Fields id and link are always returned.
   */
  fields?: TaskFields[];
  
  /**
   * Offset count for paginating through tasks.
   */
  offset?: number;
  
  /**
   * Maximum number of tasks to return.
   */
  limit?: number;
}
