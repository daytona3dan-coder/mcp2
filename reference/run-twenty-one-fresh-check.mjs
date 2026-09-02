import assert from 'node:assert/strict';

const repo='daytona3dan-coder/mcp2';
const pre={commit:'7302d485373a4ff0a11aaa95f063ab1864a647a8',path:'witnesses/run-twenty-one/pre-compromise-envelope.json',comment:5518132780,digest:'cc2c53738d3901a87ccea800721958084aa12ee35c33f963464d77ecc7747042'};
const compromise={commit:'d6e827f529a97d41f96abd431f4b9521df84b8b4',path:'witnesses/run-twenty-one/compromise-record.json',comment:5518142915,digest:'a7cd577828c61f89c9d79baa0c7fab016b307c84d73ce10f2896e71e40c1a8fb'};
const forged={commit:'736fe03854bf75d5e4796c78cff762bdb02e348f',path:'witnesses/run-twenty-one/post-compromise-forged-envelope.json',comment:5518149661,digest:'b87bbbb28dea6421dec7290fcc4a3d8ee4da2695cf9ba4833da96d9b051141bf'};

async function file(x){
  const r=await fetch(`https://raw.githubusercontent.com/${repo}/${x.commit}/${x.path}`);
  assert.equal(r.status,200,`fetch ${x.path}`);
  return await r.json();
}
const commentsResponse=await fetch(`https://api.github.com/repos/${repo}/issues/3/comments`,{headers:{accept:'application/vnd.github+json','user-agent':'mcp2-run21-fresh-check'}});
assert.equal(commentsResponse.status,200,'GitHub comments API');
const comments=await commentsResponse.json();
const byId=id=>comments.find(c=>c.id===id);
const [preDoc,compDoc,forgedDoc]=await Promise.all([file(pre),file(compromise),file(forged)]);
const preComment=byId(pre.comment),compComment=byId(compromise.comment),forgedComment=byId(forged.comment);
assert.ok(preComment&&compComment&&forgedComment,'all timestamp comments exist');
for(const [label,x,c] of [['pre',pre,preComment],['compromise',compromise,compComment],['forged',forged,forgedComment]]){
  assert.equal(c.created_at,c.updated_at,`${label} anchor unedited`);
  assert.match(c.body,new RegExp(`commit_sha=${x.commit}`),`${label} commit bound`);
  assert.match(c.body,new RegExp(`path=${x.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`),`${label} path bound`);
  assert.match(c.body,new RegExp(`object_digest=${x.digest}`),`${label} digest bound`);
}
assert.equal(preDoc.root_epoch,compDoc.compromised_root_epoch,'pre evidence root epoch matches compromised epoch');
assert.equal(preDoc.root_key_id,compDoc.compromised_root_key_id,'pre evidence root key matches compromised root');
assert.equal(forgedDoc.root_epoch,compDoc.compromised_root_epoch,'forged evidence root epoch matches compromised epoch');
assert.equal(forgedDoc.root_key_id,compDoc.compromised_root_key_id,'forged evidence root key matches compromised root');
const preAt=Date.parse(preComment.created_at),compAt=Date.parse(compComment.created_at),forgedAt=Date.parse(forgedComment.created_at);
assert.ok(preAt<compAt,'pre evidence externally anchored before compromise');
assert.ok(forgedAt>compAt,'forged evidence externally anchored after compromise');
assert.ok(Date.parse(forgedDoc.issued_at)<compAt,'forged envelope deliberately backdates internal issued_at');
console.log(JSON.stringify({
  verdict:'PASS',
  pre_classification:'PRE_COMPROMISE_EXTERNALLY_ANCHORED',
  forged_classification:'POST_COMPROMISE_PROVENANCE_UNTRUSTED',
  pre_created_at:preComment.created_at,
  compromise_created_at:compComment.created_at,
  forged_created_at:forgedComment.created_at,
  forged_internal_issued_at:forgedDoc.issued_at,
  pre_seconds_before_compromise:(compAt-preAt)/1000,
  forged_seconds_after_compromise:(forgedAt-compAt)/1000
},null,2));
