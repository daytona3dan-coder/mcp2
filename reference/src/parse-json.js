function whitespace(code) {
  return code === 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
}

function skipWs(text, i) {
  while (i < text.length && whitespace(text.charCodeAt(i))) i += 1;
  return i;
}

function scanString(text, start) {
  if (text[start] !== '"') throw new SyntaxError('expected string');
  let i = start + 1;
  while (i < text.length) {
    const ch = text.charCodeAt(i);
    if (ch === 0x22) return i + 1;
    if (ch < 0x20) throw new SyntaxError('unescaped control character');
    if (ch === 0x5c) {
      i += 1;
      if (i >= text.length) throw new SyntaxError('truncated escape');
      if (text[i] === 'u') {
        if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 1, i + 5))) throw new SyntaxError('invalid unicode escape');
        i += 5;
        continue;
      }
    }
    i += 1;
  }
  throw new SyntaxError('unterminated string');
}

function scanPrimitive(text, start) {
  let i = start;
  while (i < text.length && !whitespace(text.charCodeAt(i)) && !',]}'.includes(text[i])) i += 1;
  if (i === start) throw new SyntaxError('invalid JSON value');
  return i;
}

function scanValue(text, start) {
  let i = skipWs(text, start);
  if (text[i] === '{') {
    i = skipWs(text, i + 1);
    const seen = new Set();
    if (text[i] === '}') return i + 1;
    while (true) {
      const keyStart = i;
      const keyEnd = scanString(text, keyStart);
      const key = JSON.parse(text.slice(keyStart, keyEnd));
      if (seen.has(key)) throw new SyntaxError(`duplicate JSON member: ${key}`);
      seen.add(key);
      i = skipWs(text, keyEnd);
      if (text[i] !== ':') throw new SyntaxError('expected colon');
      i = scanValue(text, i + 1);
      i = skipWs(text, i);
      if (text[i] === '}') return i + 1;
      if (text[i] !== ',') throw new SyntaxError('expected comma');
      i = skipWs(text, i + 1);
    }
  }
  if (text[i] === '[') {
    i = skipWs(text, i + 1);
    if (text[i] === ']') return i + 1;
    while (true) {
      i = scanValue(text, i);
      i = skipWs(text, i);
      if (text[i] === ']') return i + 1;
      if (text[i] !== ',') throw new SyntaxError('expected comma');
      i = skipWs(text, i + 1);
    }
  }
  if (text[i] === '"') return scanString(text, i);
  return scanPrimitive(text, i);
}

export function parseJsonRejectDuplicateKeys(text) {
  if (typeof text !== 'string') throw new TypeError('JSON source must be text');
  const end = skipWs(text, scanValue(text, 0));
  if (end !== text.length) throw new SyntaxError('trailing JSON data');
  return JSON.parse(text);
}
