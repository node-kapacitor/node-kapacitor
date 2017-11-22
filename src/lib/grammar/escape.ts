/**
 * tagEscaper escapes tag keys, tag values, and field keys.
 * @type {Object}
 * @property {function(s: string): string } quoted Escapes and wraps quoted values.
 *
 * @example
 * ```typescript
 *
 * console.log(escape.quoted('stream\n    |from()\n        .measurement("tick")\n'));
 * // => 'stream\n    |from()\n        .measurement('tick')\n'
 * ```
 */
export const escape = {
  /**
   * quoted escapes quoted values.
   */
  quoted: (val: string) => val.replace(/"/g, '\'')
};

export const dashToCamel = (obj: any) => {
  const str = JSON.stringify(obj);

  return JSON.parse(str.toLowerCase().replace(
    /-(.)/g, (match: string, group: string) => group.toUpperCase()
  ));
}

export const camelToDash = (obj: any, parse: boolean = false) => {
  let str = '';
  switch (typeof obj) {
    case 'object':
      str = JSON.stringify(obj);
      break;
    case 'string':
      str = obj;
      break;
  }
  const res = str
    .replace(/(^[A-Z])/, (first: string) => first.toLowerCase())
    .replace(/([A-Z])/g, (letter: string) => `-${letter.toLowerCase()}`);
  return parse ? JSON.parse(res) : res;
}

export const formatAttrName = (obj: any) => {
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    if (/[A-Z]/.test(key)) {
      obj[camelToDash(key)] = obj[key];
      delete obj[key];
    }
  });
  return obj;
}
