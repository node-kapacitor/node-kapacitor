/**
 * VarType is an enumeration of TICKscript var types.
 */
export enum VarType {
  Bool = 'bool',
  Int = 'int',
  Float = 'float',
  String = 'string',
  Regex = 'regex',
  Duration = 'duration',
  Lambda = 'lambda',
  List = 'list',
  Star = 'star'
}

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

/**
 * A set of vars for overwriting any defined vars in the TICKscript.
 */
export interface IVars {
  [Attr: string]: IVar
}

export interface IVar {
  value: any,
  type: VarType,
  description?: string
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
   * A set of vars for overwriting any defined vars in the TICKscript.</br></br>
   * The vars object has the form:
   *
   * ```json
   * {
   *     "field_name" : {
   *         "value": <VALUE>,
   *         "type": <TYPE>
   *     },
   *     "another_field" : {
   *         "value": <VALUE>,
   *         "type": <TYPE>
   *     }
   * }
   * ```
   *
   * The following is a table of valid types and example values.
   *
   * | VarType     | Example Value       | Description    |
   * | ----     | -------------       | -----------      |
   * | Bool     | true                | "true" or "false"|
   * | Int      | 42                  | Any integer value|
   * | Float    | 2.5 or 67           | Any numeric value|
   * | Duration | "1s" or 1000000000  | Any integer value interpretted in nanoseconds or an influxql duration string |
   * | String   | "a string"  | Any string value  |
   * | Regex    | "^abc.*xyz" | Any string value that represents a valid Go regular expression https://golang.org/pkg/regexp/|
   * | Lambda   | "\"value\" > 5" | Any string that is a valid TICKscript lambda expression |
   * | Star     | ""  | No value is required, a star type var represents the literal `*` in TICKscript (i.e. `.groupBy(*)`)     |
   * | List     | [{"type": TYPE, "value": VALUE}] | A list of var objects. Currently lists may only contain string or star vars|
   */
  vars?: IVars;

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
   * A set of vars for overwriting any defined vars in the TICKscript.</br></br>
   * The vars object has the form:
   *
   * ```json
   * {
   *     "field_name" : {
   *         "value": <VALUE>,
   *         "type": <TYPE>
   *     },
   *     "another_field" : {
   *         "value": <VALUE>,
   *         "type": <TYPE>
   *     }
   * }
   * ```
   *
   * The following is a table of valid types and example values.
   *
   * | Type     | Example Value       | Description    |
   * | ----     | -------------       | -----------      |
   * | Bool     | true                | "true" or "false"|
   * | Int      | 42                  | Any integer value|
   * | Float    | 2.5 or 67           | Any numeric value|
   * | Duration | "1s" or 1000000000  | Any integer value interpretted in nanoseconds or an influxql duration string |
   * | String   | "a string"  | Any string value  |
   * | Regex    | "^abc.*xyz" | Any string value that represents a valid Go regular expression https://golang.org/pkg/regexp/|
   * | Lambda   | "\"value\" > 5" | Any string that is a valid TICKscript lambda expression |
   * | Star     | ""  | No value is required, a star type var represents the literal `*` in TICKscript (i.e. `.groupBy(*)`)     |
   * | List     | [{"type": TYPE, "value": VALUE}] | A list of var objects. Currently lists may only contain string or star vars|
   */
  vars?: IVars;

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
   * @default disabled
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
   * @default formatted
   */
  scriptFormat?: 'formatted' | 'raw';
}

export interface IListTemplatesOptions extends ITemplateOptions {
  /**
   * Filter results based on the pattern.
   * Uses standard shell glob matching,
   * see [this](https://golang.org/pkg/path/filepath/#Match) for more details.
   */
  pattern?: string;

  /**
   * List of fields to return. If empty returns all fields.
   * Fields id and link are always returned.
   */
  fields?: TemplateFields[];

  /**
   * Offset count for paginating through templates.
   * @default 0
   */
  offset?: number;

  /**
   * Maximum number of templates to return.
   * @default 100
   */
  limit?: number;
}


export interface ITaskOptions extends ITemplateOptions {
  /**
   * One of labels or attributes. Labels is less readable but will
   *  correctly render with all the information contained in labels.
   * @default attributes
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
   * see [this](https://golang.org/pkg/path/filepath/#Match) for more details.
   */
  pattern?: string;

  /**
   * List of fields to return. If empty returns all fields.
   * Fields id and link are always returned.
   */
  fields?: TaskFields[];

  /**
   * Offset count for paginating through tasks.
   * @default 0
   */
  offset?: number;

  /**
   * Maximum number of tasks to return.
   * @default 100
   */
  limit?: number;
}
