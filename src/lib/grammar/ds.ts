/**
 * TemplateFields is an enumeration of kapacitor template fields.
 */
export enum TemplateFields {
  /**
   * When creating resources in Kapacitor the API server will
   * return a `link` object with an `href` of the resource.
   * Clients should not need to perform path manipulation in
   * most cases and can use the `link` provided from previous calls.
   */
  link = 'link',
  /**
   * Unique identifier for the template. If empty a random ID will be chosen.
   */
  id = 'id',
  /**
   * The template type: `stream` or `batch`.
   */
  type = 'type',
  /**
   * The content of the script.
   */
  script = 'script',
  /**
   * [GraphViz](https://en.wikipedia.org/wiki/Graphviz) DOT
   * syntax formatted representation of the template DAG.</br>
   * NOTE: lables vs attributes does not matter since a
   * template is never executing.
   */
  dot = 'dot',
  /**
   * Any error encountered when reading the template.
   */
  error = 'error',
  /**
   * Date the template was first created
   */
  created = 'created',
  /**
   * Date the template was last modified
   */
  modified = 'modified',
  /**
   * A set of vars for overwriting any defined vars in the TICKscript.
   */
  vars = 'vars',
}

/**
 * TaskFields is an enumeration of kapacitor task fields.
 */
export enum TaskFields {
  /**
   * When creating resources in Kapacitor the API server will
   * return a `link` object with an `href` of the resource.
   * Clients should not need to perform path manipulation in
   * most cases and can use the `link` provided from previous calls.
   */
  link = 'link',
  /**
   * Unique identifier for the task. If empty a random ID will be chosen.
   */
  id = 'id',
  /**
   * An optional ID of a template to use instead of specifying a TICKscript
   *  and type directly.
   */
  templateId = 'template-id',
  /**
   * The task type: `stream` or `batch`.
   */
  type = 'type',
  /**
   * List of database retention policy pairs the task is allowed to access.
   */
  dbrps = 'dbrps',
  /**
   * The content of the script.
   */
  script = 'script',
  /**
   * [GraphViz](https://en.wikipedia.org/wiki/Graphviz) DOT
   *  syntax formatted representation of the task DAG.
   */
  dot = 'dot',
  /**
   * One of `enabled` or `disabled`.
   */
  status = 'status',
  /**
   * Whether the task is currently executing.
   */
  executing = 'executing',
  /**
   * Any error encountered when executing the task.
   */
  error = 'error',
  /**
   * Map of statistics about a task.
   */
  stats = 'stats',
  /**
   * Date the template was first created
   */
  created = 'created',
  /**
   * Date the template was last modified
   */
  modified = 'modified',
  /**
   * Date the task was last set to status `enabled`
   */
  lastEnabled = 'last-enabled',
  /**
   * A set of vars for overwriting any defined vars in the TICKscript.
   */
  vars = 'vars',
}

export interface ITemplate {
  /**
   * a link object with an href of the resource.Clients should not need to
   *  perform path manipulation in most cases and can use the links provided
   *  from previous calls.
   */
  readonly link?: {
    readonly ref: 'self';
    readonly herf: string;
  };

  /**
   * Unique identifier for the template. If empty a random ID will be chosen.
   */
  id?: string;

  /**
   * The template type: `stream` or `batch`.
   */
  type?: 'stream'|'batch';

  /**
   * The content of the script.
   */
  script?: string;

  /**
   * A set of vars for overwriting any defined vars in the TICKscript.
   */
  vars?: {[Attr: string]: any};

  /**
   * [GraphViz](https://en.wikipedia.org/wiki/Graphviz) DOT
   *  syntax formatted representation of the template DAG.</br>
   * NOTE: lables vs attributes does not matter since a
   *  template is never executing.
   */
  readonly dot?: string;

  /**
   * Any error encountered when reading the template.
   */
  readonly error?: string;

  /**
   * Date the template was first created.
   */
  readonly created?: Date | string | number;

  /**
   * Date the template was last modified.
   */
  readonly modified?: Date | string | number;
}

export interface IUpdateTemplate extends ITemplate {
  id: string;
}

export interface ITask {

  /**
   * a link object with an href of the resource.Clients should not need to
   *  perform path manipulation in most cases and can use the links provided
   *  from previous calls.
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
   * An optional ID of a template to use instead of specifying a TICKscript
   *  and type directly.
   */
  templateId?: string;

  /**
   * The task type: `stream` or `batch`.
   */
  type?: 'stream'|'batch';

  /**
   * The content of the script.
   */
  script?: string;

  /**
   * A set of vars for overwriting any defined vars in the TICKscript.
   */
  vars?: {[Attr: string]: any};

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
   * One of `enabled` or `disabled`.
   */
  status?: 'enabled' | 'disabled';

  /**
   * [GraphViz](https://en.wikipedia.org/wiki/Graphviz) DOT
   *  syntax formatted representation of the template DAG.</br>
   * NOTE: lables vs attributes does not matter since a
   *  template is never executing.
   */
  readonly dot?: string;

  /**
   * Any error encountered when reading the template.
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

export interface ITemplates {
  templates: ITemplate[]
}

export interface ITemplateOptions {
  /**
   * One of formatted or raw. Raw will return the script identical to
   *  how it was defined. Formatted will first format the script.
   */
  scriptFormat?: 'formatted' | 'raw';
}

export interface IListTemplatesOptions extends ITemplateOptions {
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


export interface ITaskOptions extends ITemplateOptions {
  /**
   * One of labels or attributes. Labels is less readable but will
   *  correctly render with all the information contained in labels.
   */
  dotView?: 'labels' | 'attributes';

  /**
   * Optional ID of a running replay.The returned task information
   *  will be in the context of the task for the running replay.
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
