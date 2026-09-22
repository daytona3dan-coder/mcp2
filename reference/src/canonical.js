import { createHash } from 'node:crypto';

function assertUnicodeScalarString(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError('invalid unicode scalar data');
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError('invalid unicode scalar data');
    }
  }
}

export function canonicalize(value) {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      assertUnicodeScalarString(value);
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new TypeError('non-finite number');
      return JSON.stringify(Object.is(value, -0) ? 0 : value);
    case 'object': {
      if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
      const prototype = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null) throw new TypeError('non-plain object');
      const keys = Object.keys(value);
      for (const key of keys) assertUnicodeScalarString(key);
      keys.sort();
      return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(value[k])).join(',') + '}';
    }
    default:
      throw new TypeError(`unsupported canonical type: ${typeof value}`);
  }
}

export function fingerprint(value) {
  return createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}
