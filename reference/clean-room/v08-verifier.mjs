import { createHash } from 'node:crypto';

const LOWER_SHA256=/^[a-f0-9]{64}$/;
const RFC3339=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function scalar(s){for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const n=s.charCodeAt(i+1);if(!(n>=0xdc00&&n<=0xdfff))throw new TypeError('unicode');i++;}else if(c>=0xdc00&&c<=0xdfff)throw new TypeError('unicode');}}
export function jcs(v){
  if(v===null)return'null';
  if(typeof v==='string'){scalar(v);return JSON.stringify(v);}
  if(typeof v==='boolean')return v?'true':'false';
  if(typeof v==='number'){if(!Number.isFinite(v))throw new TypeError('number');return JSON.stringify(Object.is(v,-0)?0:v);}
  if(Array.isArray(v))return'['+v.map(jcs).join(',')+']';
  if(v&&typeof v==='object'){const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==null)throw new TypeError('object');const ks=Object.keys(v);ks.forEach(scalar);ks.sort();return'{'+ks.map(k=>JSON.stringify(k)+':'+jcs(v[k])).join(',')+'}';}
  throw new TypeError('type');
}
export const sha256=(v)=>createHash('sha256').update(jcs(v),'utf8').digest('hex');
const tm=(s)=>{const x=Date.parse(s);return Number.isFinite(x)?x:null;};
const subset=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.every(x=>b.includes(x));
function extOk(req,declared,contracts){
  if(!Object.hasOwn(req,'extensions'))return true;
  const x=req.extensions;if(!x||typeof x!=='object'||Array.isArray(x))return false;
  const ids=new Set(declared??[]);
  for(const [id,body] of Object.entries(x)){
    if(!ids.has(id)||!contracts?.[id])return false;
    if(contracts[id].type==='object'&&(!body||typeof body!=='object'||Array.isArray(body)))return false;
  }
  return true;
}
function evidence(req){try{return{request_fingerprint:sha256(req),request_fingerprint_alg:'RFC8785-JCS+SHA-256'};}catch{return{request_fingerprint:null,request_fingerprint_alg:'NONCANONICALIZABLE'};}}
function deny(req,grant,now,reasons){return{decision:'DENY',reasons:[...new Set(reasons)].sort(),...evidence(req),grant_fingerprint:grant?sha256(grant):null,verified_at:now.toISOString()};}
export function verifyV08(vector){
  const req=structuredClone(vector.request);
  const grants=new Map((vector.grants??[]).map(g=>[g.grant_id,structuredClone(g)]));
  const used=new Set(vector.preconsumed_nonces??[]);
  const now=new Date(vector.now??'2026-09-02T13:30:00Z');
  const bad=[];
  const core=['request_id','grant_id','actor','action','target','policy_digest','nonce','requested_at'];
  if(!req||typeof req!=='object'||Array.isArray(req))bad.push('MALFORMED_REQUEST');
  else{
    const allowed=new Set([...core,'extensions']);
    if(Object.keys(req).some(k=>!allowed.has(k)))bad.push('MALFORMED_REQUEST');
    if(core.some(k=>typeof req[k]!=='string'||req[k].length===0))bad.push('MALFORMED_REQUEST');
    if(!LOWER_SHA256.test(req.policy_digest??''))bad.push('MALFORMED_REQUEST');
    if(!RFC3339.test(req.requested_at??'')||tm(req.requested_at)===null)bad.push('MALFORMED_REQUEST');
    if(!extOk(req,vector.declared_extensions??[],vector.extension_contracts??{}))bad.push('MALFORMED_REQUEST');
    try{sha256(req);}catch{bad.push('MALFORMED_REQUEST');}
  }
  if(bad.length)return deny(req,null,now,bad);
  const g=grants.get(req.grant_id);if(!g)return deny(req,null,now,['UNKNOWN_GRANT']);
  const reasons=[];const n=now.getTime();const gf=tm(g.valid_from),gu=tm(g.valid_until);
  if(g.status!=='active')reasons.push('GRANT_NOT_ACTIVE');
  if(gf===null||gu===null||gu<=gf)reasons.push('GRANT_NOT_ACTIVE');else{if(n<gf)reasons.push('NOT_YET_VALID');if(n>=gu)reasons.push('EXPIRED');}
  if(req.actor!==g.actor)reasons.push('ACTOR_MISMATCH');
  if(!Array.isArray(g.actions)||!g.actions.includes(req.action))reasons.push('ACTION_NOT_ALLOWED');
  if(!Array.isArray(g.targets)||!g.targets.includes(req.target))reasons.push('TARGET_NOT_ALLOWED');
  if(req.policy_digest!==g.policy_digest)reasons.push('POLICY_DIGEST_MISMATCH');
  const seen=new Set([g.grant_id]);let child=g,pid=g.parent_grant_id;
  while(pid){
    if(seen.has(pid)){reasons.push('ANCESTOR_INVALID');break;}seen.add(pid);
    const p=grants.get(pid);if(!p){reasons.push('ANCESTOR_INVALID');break;}
    const pf=tm(p.valid_from),pu=tm(p.valid_until),cf=tm(child.valid_from),cu=tm(child.valid_until);
    if(p.status!=='active'||pf===null||pu===null||n<pf||n>=pu||p.delegation?.allowed!==true||child.principal!==p.principal||child.policy_digest!==p.policy_digest||!subset(child.actions,p.actions)||!subset(child.targets,p.targets)||cf===null||cu===null||cf<pf||cu>pu)reasons.push('ANCESTOR_INVALID');
    child=p;pid=p.parent_grant_id;
  }
  if(used.has(req.nonce))reasons.push('REPLAY');
  if(reasons.length)return deny(req,g,now,reasons);
  used.add(req.nonce);
  return{decision:'ALLOW',reasons:[],...evidence(req),grant_fingerprint:sha256(g),verified_at:now.toISOString()};
}
