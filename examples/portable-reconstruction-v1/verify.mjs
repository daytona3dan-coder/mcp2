import fs from 'node:fs';
import { createHash } from 'node:crypto';

const bundle=JSON.parse(fs.readFileSync(new URL('./bundle.json',import.meta.url),'utf8'));

function scalar(s){for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const n=s.charCodeAt(i+1);if(!(n>=0xdc00&&n<=0xdfff))throw new Error('invalid unicode');i++;}else if(c>=0xdc00&&c<=0xdfff)throw new Error('invalid unicode');}}
function jcs(v){if(v===null)return'null';if(typeof v==='string'){scalar(v);return JSON.stringify(v);}if(typeof v==='boolean')return v?'true':'false';if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('non-finite');return JSON.stringify(Object.is(v,-0)?0:v);}if(Array.isArray(v))return'['+v.map(jcs).join(',')+']';if(v&&typeof v==='object'){const ks=Object.keys(v);ks.forEach(scalar);ks.sort();return'{'+ks.map(k=>JSON.stringify(k)+':'+jcs(v[k])).join(',')+'}';}throw new Error('unsupported');}
const sha=v=>createHash('sha256').update(jcs(v),'utf8').digest('hex');
const fail=m=>{throw new Error(m);};

const {request,grants,policy,receipt}=bundle;
const grant=grants.find(g=>g.grant_id===request.grant_id)??fail('grant missing');
if(sha(policy)!==request.policy_digest)fail('policy digest mismatch');
if(receipt.request_fingerprint_alg!=='RFC8785-JCS+SHA-256')fail('fingerprint algorithm mismatch');
if(sha(request)!==receipt.request_fingerprint)fail('request fingerprint mismatch');
if(sha(grant)!==receipt.grant_fingerprint)fail('grant fingerprint mismatch');
if(receipt.policy_digest!==request.policy_digest||grant.policy_digest!==request.policy_digest)fail('policy binding mismatch');
if(receipt.request_id!==request.request_id||receipt.grant_id!==request.grant_id)fail('receipt identity mismatch');
const t=Date.parse(receipt.verified_at);
if(grant.status!=='active'||t<Date.parse(grant.valid_from)||t>=Date.parse(grant.valid_until))fail('grant not valid at decision');
if(request.actor!==grant.actor||!grant.actions.includes(request.action)||!grant.targets.includes(request.target))fail('authority mismatch');
if(grant.parent_grant_id!==null)fail('example expects complete single-grant chain');
if(receipt.decision!=='ALLOW'||receipt.reasons.length!==0)fail('decision mismatch');

console.log(JSON.stringify({result:'PASS',protocol:bundle.protocol,decision:receipt.decision,request_fingerprint:receipt.request_fingerprint,grant_fingerprint:receipt.grant_fingerprint,policy_digest:receipt.policy_digest},null,2));
