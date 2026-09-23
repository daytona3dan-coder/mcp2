function syntaxError(message, index) {
  return new SyntaxError(`${message} at byte/character offset ${index}`);
}

const MAX_DEPTH = 64;

function assertUnicodeScalars(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new SyntaxError('invalid unicode scalar data');
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new SyntaxError('invalid unicode scalar data');
    }
  }
}

function validateMaterialized(value, depth = 0) {
  if (depth > MAX_DEPTH) throw new SyntaxError('JSON nesting depth exceeded');
  if (typeof value === 'string') return assertUnicodeScalars(value);
  if (typeof value === 'number' && !Number.isFinite(value)) throw new SyntaxError('non-finite JSON number');
  if (Array.isArray(value)) return value.forEach(v => validateMaterialized(v, depth + 1));
  if (value && typeof value === 'object') {
    for (const [k,v] of Object.entries(value)) {
      assertUnicodeScalars(k);
      validateMaterialized(v, depth + 1);
    }
  }
}

export function parseJsonRejectDuplicateKeys(text) {
  if (typeof text !== 'string') throw new TypeError('JSON text required');
  let i = 0;

  function ws() {
    while (i < text.length && /[\t\n\r ]/.test(text[i])) i += 1;
  }

  function parseString() {
    if (text[i] !== '"') throw syntaxError('string expected', i);
    const start = i++;
    while (i < text.length) {
      const ch = text[i++];
      if (ch === '"') return JSON.parse(text.slice(start, i));
      if (ch === '\\') {
        if (i >= text.length) throw syntaxError('unterminated escape', i);
        if (text[i] === 'u') {
          i += 1;
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i, i + 4))) throw syntaxError('invalid unicode escape', i);
          i += 4;
        } else {
          if (!'"\\/bfnrt'.includes(text[i])) throw syntaxError('invalid escape', i);
          i += 1;
        }
      } else if (ch.charCodeAt(0) < 0x20) {
        throw syntaxError('control character in string', i - 1);
      }
    }
    throw syntaxError('unterminated string', start);
  }

  function parseNumber() {
    const rest = text.slice(i);
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(rest);
    if (!match) throw syntaxError('invalid number', i);
    const numeric = Number(match[0]);
    if (!Number.isFinite(numeric)) throw syntaxError('non-finite JSON number', i);
    i += match[0].length;
  }

  function literal(word) {
    if (text.slice(i, i + word.length) !== word) throw syntaxError(`expected ${word}`, i);
    i += word.length;
  }

  function value(depth) {
    if (depth > MAX_DEPTH) throw syntaxError('JSON nesting depth exceeded', i);
    ws();
    const ch = text[i];
    if (ch === '{') return object(depth + 1);
    if (ch === '[') return array(depth + 1);
    if (ch === '"') { parseString(); return; }
    if (ch === 't') return literal('true');
    if (ch === 'f') return literal('false');
    if (ch === 'n') return literal('null');
    if (ch === '-' || /\d/.test(ch ?? '')) return parseNumber();
    throw syntaxError('JSON value expected', i);
  }

  function object(depth) {
    i += 1; ws();
    const keys = new Set();
    if (text[i] === '}') { i += 1; return; }
    while (true) {
      ws();
      const key = parseString();
      if (keys.has(key)) throw syntaxError(`duplicate object member ${JSON.stringify(key)}`, i);
      keys.add(key);
      ws();
      if (text[i] !== ':') throw syntaxError('colon expected', i);
      i += 1; value(depth); ws();
      if (text[i] === '}') { i += 1; return; }
      if (text[i] !== ',') throw syntaxError('comma expected', i);
      i += 1;
    }
  }

  function array(depth) {
    i += 1; ws();
    if (text[i] === ']') { i += 1; return; }
    while (true) {
      value(depth); ws();
      if (text[i] === ']') { i += 1; return; }
      if (text[i] !== ',') throw syntaxError('comma expected', i);
      i += 1;
    }
  }

  ws(); value(0); ws();
  if (i !== text.length) throw syntaxError('trailing data', i);
  const parsed = JSON.parse(text);
  validateMaterialized(parsed);
  return parsed;
}
