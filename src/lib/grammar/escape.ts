/**
 * tagEscaper escapes tag keys, tag values, and field keys.
 * @type {Object}
 * @property {function(s: string): string } quoted Escapes and wraps quoted values.
 *
 * @example
 * console.log(escape.quoted('stream\n    |from()\n        .measurement("tick")\n')); 
 * // => 'stream\n    |from()\n        .measurement('tick')\n'
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

export const camelToDash = (obj: any) => {
  const str = JSON.stringify(obj);
  
  return JSON.parse(str
    .replace(/(^[A-Z])/, (first: string) => first.toLowerCase())
    .replace(/([A-Z])/g, (letter: string) => `-${letter.toLowerCase()}`)
  );
}
