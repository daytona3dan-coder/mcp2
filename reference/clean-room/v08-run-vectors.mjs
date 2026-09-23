import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyV08 } from './v08-verifier.mjs';
import { MemoryAuthorityStore, verify } from '../src/verifier.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../test-vectors/v0.8');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
let failed=0,passed=0;
for(const file of walk(root).filter(f=>f.endsWith('.json'))){
  const v=JSON.parse(fs.readFileSync(file,'utf8'));
  const validators=Object.fromEntries(Object.entries(v.extension_contracts??{}).map(([id,c])=>[id,(body)=>c?.type==='object'?!!body&&typeof body==='object'&&!Array.isArray(body):false]));
  const reference=verify(v.request,new MemoryAuthorityStore(v.grants??[],v.preconsumed_nonces??[]),new Date(v.now??'2026-09-02T13:30:00Z'),{protocolVersion:'0.8.0-draft',declaredExtensions:v.declared_extensions??[],extensionValidators:validators});
  const clean=verifyV08(v);
  const expectedReasons=[...(v.expected.reasons??[])].sort();
  const ok=reference.decision===v.expected.decision&&JSON.stringify(reference.reasons)===JSON.stringify(expectedReasons)&&clean.decision===reference.decision&&JSON.stringify(clean.reasons)===JSON.stringify(reference.reasons)&&clean.request_fingerprint===reference.request_fingerprint&&clean.request_fingerprint_alg===reference.request_fingerprint_alg;
  if(ok)passed++;else{failed++;console.error('FAIL',path.relative(root,file),{expected:v.expected,reference,clean});}
}
console.log(JSON.stringify({protocol:'MCP2-0.8-paired-conformance/1',passed,failed},null,2));
if(failed)process.exit(1);
