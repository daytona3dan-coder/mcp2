function syntaxError(message, index) {
  return new SyntaxError(`${message} at byte/character offset ${index}`);
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
      if (ch === '"') {
        const raw = text.slice(start, i);
        return JSON.parse(raw);
      }
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
    i += match[0].length;
  }

  function literal(word) {
    if (text.slice(i, i + word.length) !== word) throw syntaxError(`expected ${word}`, i);
    i += word.length;
  }

  function value() {
    ws();
    const ch = text[i];
    if (ch === '{') return object();
    if (ch === '[') return array();
    if (ch === '"') { parseString(); return; }
    if (ch === 't') return literal('true');
    if (ch === 'f') return literal('false');
    if (ch === 'n') return literal('null');
    if (ch === '-' || /\d/.test(ch ?? '')) return parseNumber();
    throw syntaxError('JSON value expected', i);
  }

  function object() {
    i += 1;
    ws();
    const keys = new Set();
    if (text[i] === '}') { i += 1; return; }
    while (true) {
      ws();
      const key = parseString();
      if (keys.has(key)) throw syntaxError(`duplicate object member ${JSON.stringify(key)}`, i);
      keys.add(key);
      ws();
      if (text[i] !== ':') throw syntaxError('colon expected', i);
      i += 1;
      value();
      ws();
      if (text[i] === '}') { i += 1; return; }
      if (text[i] !== ',') throw syntaxError('comma expected', i);
      i += 1;
    }
  }

  function array() {
    i += 1;
    ws();
    if (text[i] === ']') { i += 1; return; }
    while (true) {
      value();
      ws();
      if (text[i] === ']') { i += 1; return; }
      if (text[i] !== ',') throw syntaxError('comma expected', i);
      i += 1;
    }
  }

  ws();
  value();
  ws();
  if (i !== text.length) throw syntaxError('trailing data', i);
  return JSON.parse(text);
}
