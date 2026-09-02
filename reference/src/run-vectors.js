import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryAuthorityStore, verify } from './verifier.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const vectorsRoot = path.resolve(here, '../../test-vectors');
const fixedNow = new Date('2026-09-02T13:30:00Z');

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const p = path.join(dir,e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

let failed = 0;
for (const file of walk(vectorsRoot).filter(f => f.endsWith('.json'))) {
  const v = JSON.parse(fs.readFileSync(file,'utf8'));
  const s = new MemoryAuthorityStore(v.grants ?? [], v.preconsumed_nonces ?? []);
  const d = verify(v.request, s, fixedNow);
  const reasonsOk = JSON.stringify(d.reasons) === JSON.stringify([...(v.expected.reasons ?? [])].sort());
  const ok = d.decision === v.expected.decision && reasonsOk;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${path.relative(vectorsRoot,file)} => ${d.decision} ${d.reasons.join(',')}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
